import { addMinutes } from "date-fns";
import { Request, Response } from "express";
import _ from "lodash";
import { Brackets, getRepository, getTreeRepository } from "typeorm";
import { PageQuestion } from "../entities/PageQuestion";
import { Question } from "../entities/Question";
import QuestionTemplate from "../entities/QuestionTemplate";
import {
  GradingData,
  PageGradingData,
  QuestionGradingData
} from "../types/grading";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester } from "../utils/papers";

/**
 * IMPORTANT NOTE
 * Since this is a MVP, this controller assumes that your allocation is on the root question
 * It will NOT recursively get inherited allocations
 */
export async function questionToMark(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const questionTemplateId = Number(request.params.id);
  const questionTemplate = await getRepository(QuestionTemplate).findOne(
    questionTemplateId,
    { relations: ["scriptTemplate"] }
  );
  if (!questionTemplate) {
    response.sendStatus(404);
    return;
  }
  const { paperId } = questionTemplate.scriptTemplate!;

  const allowed = await allowedRequester(
    requesterId,
    paperId,
    PaperUserRole.Marker
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { requester } = allowed;

  const rootQuestionTemplate = await getTreeRepository(QuestionTemplate)
    .createAncestorsQueryBuilder(
      "questionTemplate",
      "questionTemplateClosure",
      questionTemplate
    )
    .andWhere("questionTemplate.parentQuestionTemplate is null")
    .andWhere("questionTemplate.discardedAt is null")
    .innerJoin(
      "questionTemplate.allocations",
      "allocation",
      "allocation.paperUserId = :id",
      { id: requester.id }
    )
    .getOne();
  if (!rootQuestionTemplate) {
    response.sendStatus(404);
    return;
  }

  // prettier-ignore
  const rootQuestionData = await getRepository(Question)
    .createQueryBuilder("question")
    .where("question.discardedAt IS NULL")
    .innerJoin("question.questionTemplate", "questionTemplate", "questionTemplate.id = :id", { id: rootQuestionTemplate.id })
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
    .addSelect("student.matriculationNumber", "matriculationNumber")
    .getRawOne();

  if (!rootQuestionData) {
    response.sendStatus(204);
    return;
  }

  // Prevent other markers from accessing this route for the next 30 minutes
  await getRepository(Question)
    .createQueryBuilder("question")
    .update()
    .set({ currentMarker: requester, currentMarkerUpdatedAt: new Date() })
    .where("id = :id", { id: rootQuestionData.id })
    .execute();

  const {
    matriculationNumber,
    ...rootQuestion
  }: {
    matriculationNumber: string | null;
  } & QuestionGradingData = rootQuestionData;

  const descendantQuestionTemplatesData = await getTreeRepository(
    QuestionTemplate
  )
    .createDescendantsQueryBuilder(
      "questionTemplate",
      "questionTemplateClosure",
      rootQuestionTemplate
    )
    .andWhere("questionTemplate.discardedAt is null")
    .andWhere("questionTemplate.parentQuestionTemplateId is not null")
    // TODO: Not sure how to select the data via their descendantsQueryBuilder
    // .addSelect("questionTemplate.id", "id")
    // .select("questionTemplate.name", "name")
    // .addSelect("questionTemplate.score", "maxScore")
    // .addSelect("questionTemplate.topOffset", "topOffset")
    // .addSelect("questionTemplate.leftOffset", "leftOffset")
    .getMany();

  // prettier-ignore
  const descendantQuestions = await Promise.all(descendantQuestionTemplatesData.map(async descendant => {
    const question = await getRepository(Question).createQueryBuilder("question")
      .where("question.discardedAt is null")
      .innerJoin("question.questionTemplate", "questionTemplate", "questionTemplate.id = :id", { id: descendant.id })
      .leftJoin("question.marks", "mark")
      .andWhere(
        new Brackets(qb => {
          qb.where("mark IS NULL")
          .orWhere("mark.discardedAt IS NOT NULL");
        })
      )
      .select("question.id", "id")
      .addSelect("mark.score", "score")
      .getRawOne();
    const { id, score } = question;
      
    // Temporary workaround for line 131
    const descendantQuestion: QuestionGradingData = {
      id,
      name: descendant.name,
      score,
      maxScore: descendant.score,
      topOffset: descendant.topOffset,
      leftOffset: descendant.leftOffset,
    }

    return descendantQuestion;
  }));

  const questionIds = descendantQuestions.map(child => child.id);
  questionIds.push(rootQuestion.id);

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

  const pages: PageGradingData[] = _.chain(pagesData)
    .uniqBy("id")
    .groupBy("id")
    .map((array, id) => {
      const questionIds = Array.from(
        new Set(array.map(element => element["questionId"]))
      );
      const annotations = array
        .filter(
          element =>
            "annotationId" in element &&
            "layer" in element &&
            element["annotationId"] !== null &&
            element["annotationId"] !== undefined &&
            element["layer"] !== null &&
            element["layer"] !== undefined
        )
        .map(element => ({
          id: element["annotationId"],
          layer: element["layer"]
        }));
      return {
        id: parseInt(id),
        pageNo: array[0].pageNo,
        imageUrl: array[0].imageUrl,
        questionIds,
        annotations
      };
    })
    .value();

  const data: GradingData = {
    matriculationNumber,
    rootQuestion,
    descendantQuestions,
    pages
  };

  response.status(200).json(data);
}
