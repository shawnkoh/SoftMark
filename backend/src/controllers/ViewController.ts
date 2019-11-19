import { addMinutes } from "date-fns";
import { Request, Response } from "express";
import _ from "lodash";
import {
  Brackets,
  getRepository,
  getTreeRepository,
  SelectQueryBuilder
} from "typeorm";
import { Page } from "../entities/Page";
import { PageQuestionTemplate } from "../entities/PageQuestionTemplate";
import { Question } from "../entities/Question";
import QuestionTemplate from "../entities/QuestionTemplate";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { AnnotationViewData } from "../types/view";
import { allowedRequester } from "../utils/papers";
import { generatePages } from "../utils/questionTemplate";

function selectQuestionViewData<T>(queryBuilder: SelectQueryBuilder<T>) {
  return queryBuilder
    .select("question.id", "id")
    .addSelect("questionTemplate.name", "name")
    .addSelect("mark.score", "score")
    .addSelect("questionTemplate.score", "maxScore")
    .addSelect("questionTemplate.topOffset", "topOffset")
    .addSelect("questionTemplate.leftOffset", "leftOffset");
}

export async function viewScript(request: Request, response: Response) {
  //   const payload = response.locals.payload as AccessTokenSignedPayload;
  //   const requesterId = payload.userId;
  //   const scriptId = Number(request.params.id);
  //   const rootQuestionData = await getRootQuestion(scriptId).getRawOne();
  //   if (!rootQuestionData) {
  //     response.sendStatus(404);
  //     return;
  //   }
  //   const {
  //     paperId,
  //     studentId,
  //     matriculationNumber,
  //     questionTemplateId,
  //     ...rootQuestion
  //   } = rootQuestionData;
  //   const allowed = await allowedRequester(
  //     requesterId,
  //     paperId,
  //     PaperUserRole.Student
  //   );
  //   if (!allowed) {
  //     response.sendStatus(404);
  //     return;
  //   }
  //   const descendantQuestionTemplates = await getDescendantQuestionTemplates(
  //     questionTemplateId
  //   ).getMany();
  //   const descendantQuestionTemplateIds = descendantQuestionTemplates.map(
  //     descendant => descendant.id
  //   );
  //   let descendantQuestions = [];
  //   if (descendantQuestionTemplateIds.length > 0) {
  //     descendantQuestions = await getDescendantQuestions(
  //       descendantQuestionTemplateIds
  //     ).getRawMany();
  //   }
  //   const questionIds = descendantQuestions.map(descendant => descendant.id);
  //   questionIds.push(rootQuestion.id);
  //   const pagesData = await getPagesData(questionIds).getRawMany();
  //   const pages = getPages(pagesData);
  //   const data: ScriptViewData = {
  //     rootQuestion,
  //     studentId,
  //     matriculationNumber,
  //     descendantQuestions,
  //     pages
  //   };
  //   response.status(200).json(data);
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
      { id: requesterId }
    )
    .getOne();
  if (!rootQuestionTemplate) {
    response.sendStatus(404);
    return;
  }

  const descendantQuestionTemplates = await getTreeRepository(
    QuestionTemplate
  ).findDescendants(rootQuestionTemplate);
  const descendantQuestionTemplateIds = descendantQuestionTemplates.map(
    descendant => descendant.id
  );

  // Objective here is to pick a script to mark that has an unmarked leaf question based on the descendant question templates
  // Once we have the scriptId, we can then load the script's question template's leaves.
  // Assumes that questionTemplates with displayPage are leaves
  // Assumes that questions are always leaves
  // TODO: This is extremely inefficient because it loads almost all questions
  let script: any = null;
  if (descendantQuestionTemplateIds.length > 0) {
    script = await getRepository(Question)
      .createQueryBuilder("question")
      .where("question.discardedAt IS NULL")
      .andWhere("question.questionTemplateId IN (:...ids)", {
        ids: descendantQuestionTemplateIds
      })
      // Prevent race condition
      .andWhere(
        new Brackets(qb => {
          qb.where("question.currentMarker IS NULL")
            .orWhere("question.currentMarkerId = :id", { id: requesterId })
            // Prevent other markers from accessing this route for the next 30 minutes
            .orWhere("question.currentMarkerUpdatedAt < :date", {
              date: addMinutes(new Date(), -30)
            });
        })
      )
      .innerJoin("question.script", "script", "script.discardedAt IS NULL")
      .leftJoin("script.student", "student", "student.discardedAt IS NULL")
      .innerJoin(
        "question.questionTemplate",
        "questionTemplate",
        "questionTemplate.discardedAt IS NULL"
      )
      .leftJoin("question.marks", "mark", "mark.discardedAt IS NULL")
      .andWhere("mark IS NULL")
      .select("script.id", "id")
      .addSelect("student.id", "studentId")
      .addSelect("student.matriculationNumber", "matriculationNumber")
      .getRawOne();
  }
  if (!script) {
    response.sendStatus(204);
    return;
  }

  const { id, studentId, matriculationNumber } = script;

  const questionsQuery = getRepository(Question)
    .createQueryBuilder("question")
    .where("question.discardedAt IS NULL")
    .andWhere("question.scriptId = :id", { id: script.id })
    .andWhere("question.questionTemplateId IN (:...ids)", {
      ids: descendantQuestionTemplateIds
    })
    .innerJoin(
      "question.questionTemplate",
      "questionTemplate",
      "questionTemplate.discardedAt IS NULL"
    )
    .leftJoin("question.marks", "mark", "mark.discardedAt IS NULL");

  const questions = await selectQuestionViewData(questionsQuery).getRawMany();
  // Lock all the script's questions for the root template's descendants
  questionsQuery
    .update()
    .set({ currentMarker: requester, currentMarkerUpdatedAt: new Date() })
    .execute();

  const descendantPageNos = descendantQuestionTemplates
    .filter(descendant => !!descendant.pageCovered)
    .map(descendant => generatePages(descendant.pageCovered!));

  // Merge all the pageNos
  const pageNoSet = new Set<Number>();
  descendantPageNos.forEach(descendant =>
    descendant.forEach(pageNo => pageNoSet.add(pageNo))
  );
  const pageNos = Array.from(pageNoSet);

  const pagesData = await getRepository(Page)
    .createQueryBuilder("page")
    .where("page.discardedAt IS NULL")
    .andWhere("page.scriptId = :id", { id })
    .andWhere("page.pageNo IN (:...pageNos)", { pageNos })
    .leftJoin(
      "page.annotations",
      "annotation",
      "annotation.paperUserId = :requesterId",
      { requesterId }
    )
    .select("page.id", "id")
    .addSelect("page.pageNo", "pageNo")
    .addSelect("page.imageUrl", "imageUrl")
    .addSelect("annotation.id", "annotationId")
    .addSelect("annotation.layer", "layer")
    .getRawMany();

  // Array-ize annotations
  const pagesWithAnnotations = _.chain(pagesData)
    .groupBy("id")
    .map((value, index) => {
      const annotations: AnnotationViewData[] = _.map(value, value =>
        _.pick(value, "annotationId", "layer")
      )
        .filter(annotation => !!annotation.annotationId && !!annotation.layer)
        .map(annotation => ({
          id: annotation.annotationId,
          layer: annotation.layer
        }));

      return { ..._.pick(value[0], "id", "pageNo", "imageUrl"), annotations };
    })
    .value();

  const pageQuestionTemplatesData = await getRepository(PageQuestionTemplate)
    .createQueryBuilder("pageQuestionTemplate")
    .where("pageQuestionTemplate.questionTemplateId IN (:...ids)", {
      ids: descendantQuestionTemplateIds
    })
    .innerJoin("pageQuestionTemplate.pageTemplate", "pageTemplate")
    .select("pageTemplate.pageNo", "pageNo")
    .addSelect("pageQuestionTemplate.questionTemplateId", "questionTemplateId")
    .getRawMany();

  const questionTemplateIdsByPageNo = _.chain(pageQuestionTemplatesData)
    .groupBy("pageNo")
    .mapValues(value => value.map(value => value.questionTemplateId))
    .value();

  const pages = pagesWithAnnotations.map(page => ({
    ...page,
    questionIds: questionTemplateIdsByPageNo[page.id]
  }));

  // const data: ScriptViewData = {
  const data = {
    id,
    studentId,
    matriculationNumber,
    rootQuestionTemplate,
    questions,
    pages
  };

  response.status(200).json(data);
}
