import { addMinutes } from "date-fns";
import { Request, Response } from "express";
import _ from "lodash";
import { Brackets, createQueryBuilder, getRepository, IsNull } from "typeorm";
import { Mark } from "../entities/Mark";
import { PageQuestion } from "../entities/PageQuestion";
import { Question } from "../entities/Question";
import QuestionTemplate from "../entities/QuestionTemplate";
import { isAllocated } from "../middlewares/canModifyMark";
import { PageGradingData, QuestionGradingData } from "../types/grading";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester } from "../utils/papers";

export async function markQuestion(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.id;
  const questionTemplateId = Number(request.params.id);
  const questionTemplate = await getRepository(QuestionTemplate).findOne(
    questionTemplateId,
    {
      relations: ["scriptTemplate", "allocations"],
      where: { discardedAt: IsNull() }
    }
  );
  if (!questionTemplate) {
    response.sendStatus(404);
    return;
  }
  const paperId = questionTemplate.scriptTemplate!.paperId;
  const allowed = await allowedRequester(
    requesterId,
    paperId,
    PaperUserRole.Marker
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { paper, requester } = allowed;

  if (!(await isAllocated(questionTemplate, requesterId))) {
    response.sendStatus(404);
    return;
  }

  // prettier-ignore
  const parentQuestionData = await getRepository(Question)
    .createQueryBuilder("question")
    .where("question.discardedAt IS NULL")
    .innerJoin("question.questionTemplate", "questionTemplate", "questionTemplate.id = :id", { id: questionTemplateId })
    // Ensure that the question is tagged to a script and a student
    .innerJoin("question.script", "script")
    .innerJoin("script.student", "student")
    // Ensure that there are no active marks
    .leftJoin("question.marks", "mark")
    .andWhere(
      new Brackets(qb => {
        qb.where("mark IS NULL")
        .orWhere("mark.discardedAt IS NOT NULL");
      })
    )
    // Prevent race condition
    .andWhere(
      new Brackets(qb => {
        qb.where("question.currentMarker IS NULL")
        .orWhere("question.currentMarkerId = :id", { id: requester.id })
        // Prevent other markers from accessing this route for the next 30 minutes
        .orWhere("question.currentMarkerUpdatedAt < :date", { date: addMinutes(new Date(), -30) });
      })
    )
    .select("question.id", "id")
    .addSelect("questionTemplate.name", "name")
    .addSelect("NULL", "score")
    .addSelect("questionTemplate.score", "maxScore")
    .addSelect("questionTemplate.topOffset", "topOffset")
    .addSelect("questionTemplate.leftOffset", "leftOffset")
    .addSelect("NULL", "parentQuestionId")
    .addSelect("student.matriculationNumber", "matriculationNumber")
    .getRawOne();

  if (!parentQuestionData) {
    response.sendStatus(204);
    return;
  }

  // Prevent other markers from accessing this route for the next 30 minutes
  await getRepository(Question)
    .createQueryBuilder("question")
    .update()
    .set({ currentMarker: requester, currentMarkerUpdatedAt: new Date() })
    .where("id = :id", { id: parentQuestionData.id })
    .execute();

  const {
    matriculationNumber,
    ...parentQuestion
  }: {
    matriculationNumber: string | null;
  } & QuestionGradingData = parentQuestionData;

  // TODO: Get actual parent question instead of assume it is the parent - NOT IN MVP

  // The point of getting the mark is because the parent question may already have a mark

  let childQuestions: QuestionGradingData[];

  // TODO: currently assumes questionTemplate as parentQuestionTemplate
  const childQuestionTemplates = await getRepository(QuestionTemplate).find({
    parentQuestionTemplate: questionTemplate,
    discardedAt: IsNull()
  });

  if (childQuestionTemplates.length === 0) {
    childQuestions = [];
  } else {
    const childQuestionTemplateIds = childQuestionTemplates.map(
      child => child.id
    );
    const childQuestionsData = await getRepository(Question)
      .createQueryBuilder("question")
      .innerJoin("question.questionTemplate", "questionTemplate")
      .where("questionTemplate.id IN (:...ids)", {
        ids: childQuestionTemplateIds
      })
      .select("question.id", "id")
      .addSelect("questionTemplate.name", "name")
      .addSelect("questionTemplate.score", "maxScore")
      .addSelect("questionTemplate.topOffset", "topOffset")
      .addSelect("questionTemplate.leftOffset", "leftOffset")
      .getRawMany();

    childQuestions = await Promise.all(
      childQuestionsData.map(async questionData => {
        const mark = await createQueryBuilder(Mark, "mark")
          .select("mark.score", "score")
          .where("mark.discardedAt is null")
          .innerJoin("mark.question", "question", "question.id = :id", {
            id: questionData.id
          })
          .getRawOne();
        return {
          ...questionData,
          score: mark ? mark.score : null,
          // TODO: does not support recursive
          parentQuestionId: parentQuestion.id
        };
      })
    );
  }

  const questionIds = childQuestions.map(child => child.id);
  questionIds.push(parentQuestion.id);

  const pagesData = await getRepository(PageQuestion)
    .createQueryBuilder("pageQuestion")
    .where("pageQuestion.discardedAt IS NULL")
    .andWhere("pageQuestion.questionId IN (:...ids)", { ids: questionIds })
    .innerJoin("pageQuestion.page", "page")
    .select("page.id", "id")
    .addSelect("page.pageNo", "pageNo")
    .addSelect("page.imageUrl", "imageUrl")
    .leftJoin("page.annotations", "annotation")
    .addSelect("annotation.id", "annotationId")
    .addSelect("annotation.layer", "layer")
    .getRawMany();

  let pages: PageGradingData[];

  const result = _.chain(pagesData)
    .groupBy("id")
    .map((array, id) => {
      console.log(array, id);
      return {
        id,
        annotationIds: Array.from(
          new Set(array.map(element => element["annotationId"]))
        )
      };
    });

  // for debugging - remove this
  response.status(200).json(result);

  // collate raw pages data
  // pages = _.uniqBy(pagesData, "id");
  // const pagesById = _.groupBy(pagesData, pageData => {
  //   return pageData.id;
  // });
  // const annotationsByPageId = _.mapValues(pagesById, page => {
  //   return page.map(field => {
  //     const annotation = _.pick(field, "annotationId", "layer");
  //     return { id: annotation.annotationId, layer: annotation.layer };
  //     return annotation;
  //   });
  // });
  // _.reduce(pagesData, (prev, curr, index, list) => {
  // }, [])

  // uncomment this when you finished transforming pages
  // const data: GradingData = {
  //   matriculationNumber,
  //   parentQuestion,
  //   childQuestions,
  //   pages
  // };
  // response.status(200).json(data);
}
