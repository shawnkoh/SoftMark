import { addMinutes } from "date-fns";
import { Request, Response } from "express";
import _ from "lodash";
import {
  Brackets,
  getRepository,
  getTreeRepository,
  SelectQueryBuilder
} from "typeorm";
import { PageQuestion } from "../entities/PageQuestion";
import { PaperUser } from "../entities/PaperUser";
import { Question } from "../entities/Question";
import QuestionTemplate from "../entities/QuestionTemplate";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { PageViewData, QuestionViewData, ScriptViewData } from "../types/view";
import { allowedRequester } from "../utils/papers";

function selectQuestionViewData<T>(queryBuilder: SelectQueryBuilder<T>) {
  return queryBuilder
    .select("question.id", "id")
    .addSelect("questionTemplate.name", "name")
    .addSelect("mark.score", "score")
    .addSelect("questionTemplate.score", "maxScore")
    .addSelect("questionTemplate.topOffset", "topOffset")
    .addSelect("questionTemplate.leftOffset", "leftOffset");
}

function getRootQuestion(scriptId: number) {
  const queryBuilder = getRepository(Question)
    .createQueryBuilder("question")
    .where("question.discardedAt IS NULL")
    .innerJoin(
      "question.script",
      "script",
      "script.id = :id AND script.discardedAt IS NULL",
      { id: scriptId }
    )
    .leftJoin("script.student", "student", "student.discardedAt IS NULL")
    .innerJoin(
      "question.questionTemplate",
      "questionTemplate",
      "questionTemplate.discardedAt IS NULL AND questionTemplate.parentQuestionTemplateId IS NULL"
    )
    .leftJoin("question.marks", "mark", "mark.discardedAt IS NULL");

  return selectQuestionViewData(queryBuilder)
    .addSelect("student.matriculationNumber", "matriculationNumber")
    .addSelect("script.paperId", "paperId")
    .addSelect("questionTemplate.id", "questionTemplateId");

  // consider showing all the root questions
  // TODO: select proper first question
}

function getDescendantQuestionTemplates(
  questionTemplate: QuestionTemplate | number
) {
  return getTreeRepository(QuestionTemplate)
    .createDescendantsQueryBuilder(
      "questionTemplate",
      "questionTemplateClosure",
      questionTemplate as QuestionTemplate // providing a number works too
    )
    .andWhere("questionTemplate.discardedAt IS NULL")
    .andWhere("questionTemplate.parentQuestionTemplateId IS NOT NULL");
}

function getDescendantQuestions(descendantQuestionTemplateIds: number[]) {
  const queryBuilder = getRepository(Question)
    .createQueryBuilder("question")
    .where("question.questionTemplateId IN (:...ids)", {
      ids: descendantQuestionTemplateIds
    })
    .andWhere("question.discardedAt IS NULL")
    .innerJoin(
      "question.questionTemplate",
      "questionTemplate",
      "questionTemplate.discardedAt IS NULL"
    )
    .leftJoin("question.marks", "mark", "mark.discardedAt IS NULL");

  return selectQuestionViewData(queryBuilder);
}

function getPagesData(questionIds: number[]) {
  return getRepository(PageQuestion)
    .createQueryBuilder("pageQuestion")
    .where("pageQuestion.discardedAt IS NULL")
    .andWhere("pageQuestion.questionId IN (:...ids)", { ids: questionIds })
    .innerJoin("pageQuestion.page", "page")
    .select("page.id", "id")
    .addSelect("page.pageNo", "pageNo")
    .addSelect("page.imageUrl", "imageUrl")
    .leftJoin("page.annotations", "annotation")
    .addSelect("annotation.id", "annotationId")
    .addSelect("annotation.layer", "layer");
}

function getPages(pagesData: any): PageViewData[] {
  return _.chain(pagesData)
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
}

function lockQuestion(requester: PaperUser, questionId: number) {
  return getRepository(Question)
    .createQueryBuilder("question")
    .update()
    .set({ currentMarker: requester, currentMarkerUpdatedAt: new Date() })
    .where("id = :id", { id: questionId });
}

export async function viewScript(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const scriptId = Number(request.params.id);

  const rootQuestionData = await getRootQuestion(scriptId).getRawOne();
  if (!rootQuestionData) {
    response.sendStatus(404);
    return;
  }
  const {
    paperId,
    matriculationNumber,
    questionTemplateId,
    ...rootQuestion
  } = rootQuestionData;
  const allowed = await allowedRequester(
    requesterId,
    paperId,
    PaperUserRole.Student
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  const descendantQuestionTemplates = await getDescendantQuestionTemplates(
    questionTemplateId
  ).getMany();

  const descendantQuestionTemplateIds = descendantQuestionTemplates.map(
    descendant => descendant.id
  );

  const descendantQuestions = await getDescendantQuestions(
    descendantQuestionTemplateIds
  ).getRawMany();

  const questionIds = descendantQuestions.map(descendant => descendant.id);
  questionIds.push(rootQuestion.id);

  const pagesData = await getPagesData(questionIds).getRawMany();

  const pages = getPages(pagesData);

  const data: ScriptViewData = {
    rootQuestion,
    matriculationNumber,
    descendantQuestions,
    pages
  };

  response.status(200).json(data);
}

/**
 * IMPORTANT NOTE
 * Since this is a MVP, this controller assumes that your allocation is on the root question
 * It will NOT recursively get inherited allocations
 *
 * TODO: Make use of the query builder functions above to shorten this code
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
  await lockQuestion(requester, rootQuestionData.id).execute();

  const {
    matriculationNumber,
    ...rootQuestion
  }: {
    matriculationNumber: string | null;
  } & QuestionViewData = rootQuestionData;

  const descendantQuestionTemplates = await getDescendantQuestionTemplates(
    rootQuestionTemplate
  ).getMany();

  const descendantQuestionTemplateIds = descendantQuestionTemplates.map(
    descendant => descendant.id
  );

  const descendantQuestions = await getDescendantQuestions(
    descendantQuestionTemplateIds
  ).getRawMany();

  const questionIds = descendantQuestions.map(child => child.id);
  questionIds.push(rootQuestion.id);

  const pagesData = await getPagesData(questionIds)
    .andWhere("annotation.paperUserId = :id", { id: requester.id })
    .getRawMany();

  const pages: PageViewData[] = getPages(pagesData);

  const data: ScriptViewData = {
    matriculationNumber,
    rootQuestion,
    descendantQuestions,
    pages
  };

  response.status(200).json(data);
}
