import { addMinutes } from "date-fns";
import { Request, Response } from "express";
import { chain } from "lodash";
import {
  Brackets,
  getRepository,
  getTreeRepository,
  SelectQueryBuilder
} from "typeorm";
import { Page } from "../entities/Page";
import { PageTemplate } from "../entities/PageTemplate";
import { Question } from "../entities/Question";
import QuestionTemplate from "../entities/QuestionTemplate";
import { Script } from "../entities/Script";
import { AnnotationLine } from "../types/annotations";
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

function selectPageViewData<T>(
  query: SelectQueryBuilder<T>,
  overwrite: boolean = true
) {
  const result = overwrite
    ? query.select("page.id", "id")
    : query.addSelect("page.id", "id");
  return result
    .addSelect("page.pageNo", "pageNo")
    .addSelect("page.imageUrl", "imageUrl")
    .addSelect("annotation.id", "annotationId")
    .addSelect("annotation.layer", "layer")
    .addSelect("question.id", "questionId");
}

function selectScriptData<T>(
  query: SelectQueryBuilder<T>,
  overwrite: boolean = true
) {
  const result = overwrite
    ? query.select("script.id", "id")
    : query.addSelect("script.id", "id");
  return result
    .addSelect("script.paperId", "paperId")
    .addSelect("student.id", "studentId")
    .addSelect("student.matriculationNumber", "matriculationNumber");
}

/**
 * Loads everything related to the Script.
 * Unlike questionToMark, does not filter the pages and questions based on the rootQuestionTemplate
 * Primary reason: extra pages that are not tagged to a question should still be visible.
 */
export async function viewScript(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const scriptId = Number(request.params.id);

  const scriptQuery = () =>
    getRepository(Script)
      .createQueryBuilder("script")
      .where("script.id = :scriptId", { scriptId })
      .andWhere("script.discardedAt IS NULL");

  const script = await selectScriptData(scriptQuery())
    .leftJoin("script.student", "student", "student.discardedAt IS NULL")
    .getRawOne();
  if (!script) {
    response.sendStatus(404);
    return;
  }

  const { id, studentId, paperId, matriculationNumber } = script;
  // Only allow the student to get his own script or any marker and above
  if (
    requesterId !== studentId &&
    !allowedRequester(requesterId, paperId, PaperUserRole.Marker)
  ) {
    response.sendStatus(404);
    return;
  }

  const questionsQuery = () =>
    scriptQuery()
      .innerJoin("script.questions", "question", "question.discardedAt IS NULL")
      .innerJoin(
        "question.questionTemplate",
        "questionTemplate",
        "questionTemplate.discardedAt IS NULL"
      );

  const questions: QuestionViewData[] = await selectQuestionViewData(
    questionsQuery()
  )
    .leftJoin("question.marks", "mark", "mark.discardedAt IS NULL")
    .getRawMany();

  // TODO: Not sure how useful rootQuestionTemplate is in viewScript
  const rootQuestionTemplate = await questionsQuery()
    .orderBy("questionTemplate.displayPage", "ASC")
    .select("questionTemplate.id", "id")
    .addSelect("questionTemplate.name", "name")
    .getRawOne();

  if (!rootQuestionTemplate) {
    response.sendStatus(204);
    return;
  }

  const pagesData: Array<{
    id: number;
    pageNo: number;
    questionId: number;
    annotationId: number | null;
    layer: any;
    imageUrl: string;
  }> = await selectPageViewData(questionsQuery())
    .innerJoin("script.pages", "page", "page.discardedAt IS NULL")
    .leftJoin("page.annotations", "annotation")
    .getRawMany();

  const pages = pagesData.reduce<{
    [k: string]: PageViewData;
  }>((c, { id, pageNo, questionId, annotationId, layer, imageUrl }) => {
    /* New key, create new entry */
    if (!c[id]) {
      c[id] = {
        id,
        pageNo,
        imageUrl,
        questionIds: [questionId],
        /* Add anotation only if it isn't empty */
        annotations:
          annotationId !== null && layer !== null
            ? [{ id: annotationId, layer }]
            : []
      };
    } else {
      /* Key exists already */
      /* Question ID is new, so add it */
      if (!c[id].questionIds.includes(questionId))
        c[id].questionIds.push(questionId);

      /* Annotation data is new, so add it */
      if (
        /* Annotation not empty */
        annotationId !== null &&
        layer !== null &&
        /* Annotation not already in array */
        !c[id].annotations.includes({ id: annotationId, layer })
      )
        c[id].annotations.push({ id: annotationId, layer });
    }
    return c;
  }, {});

  const data: ScriptViewData = {
    id,
    studentId,
    matriculationNumber,
    rootQuestionTemplate,
    questions,
    pages: Object.values(pages) as any
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
  const { userId } = payload;
  const questionTemplateId = Number(request.params.id);
  const questionTemplate = await getRepository(QuestionTemplate)
    .createQueryBuilder("questionTemplate")
    .where("questionTemplate.id = :questionTemplateId", { questionTemplateId })
    .andWhere("questionTemplate.discardedAt IS NULL")
    .innerJoinAndMapOne(
      "questionTemplate.scriptTemplate",
      "questionTemplate.scriptTemplate",
      "scriptTemplate",
      "scriptTemplate.discardedAt IS NULL"
    )
    .getOne();
  if (!questionTemplate) {
    response.sendStatus(404);
    return;
  }
  const { paperId } = questionTemplate.scriptTemplate!;

  const allowed = await allowedRequester(userId, paperId, PaperUserRole.Marker);
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
    .andWhere("questionTemplate.parentQuestionTemplateId IS NULL")
    .andWhere("questionTemplate.discardedAt IS NULL")
    .innerJoin(
      "questionTemplate.allocations",
      "allocation",
      "allocation.paperUserId = :paperUserId",
      { paperUserId: requester.id }
    )
    .getOne();
  if (!rootQuestionTemplate) {
    response.sendStatus(404);
    return;
  }

  const descendantQuestionTemplates = await getTreeRepository(
    QuestionTemplate
  ).findDescendants(rootQuestionTemplate);
  const descendantQuestionTemplateIds = descendantQuestionTemplates
    .filter(descendant => !descendant.discardedAt)
    .map(descendant => descendant.id);

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
          qb.where("question.currentMarkerId IS NULL")
            .orWhere("question.currentMarkerId = :id", { id: requester.id })
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
    .andWhere("question.scriptId = :id", { id })
    .andWhere("question.questionTemplateId IN (:...ids)", {
      ids: descendantQuestionTemplateIds
    })
    .innerJoin(
      "question.questionTemplate",
      "questionTemplate",
      "questionTemplate.discardedAt IS NULL"
    )
    .leftJoin("question.marks", "mark", "mark.discardedAt IS NULL");

  const questions: (QuestionViewData & {
    questionTemplateId: number;
  })[] = await selectQuestionViewData(questionsQuery)
    // this is not necessary for frontend but its needed to calculate PageViewData
    .addSelect("questionTemplate.id", "questionTemplateId")
    .getRawMany();

  // Lock all the script's questions for the root template's descendants
  // Can't use questionsQuery because of the joins and the different syntax required (no using question.)
  await getRepository(Question)
    .createQueryBuilder("question")
    .update()
    .set({ currentMarker: requester, currentMarkerUpdatedAt: new Date() })
    .where("discardedAt IS NULL")
    .andWhere("scriptId = :id", { id })
    .andWhere("questionTemplateId IN (:...ids)", {
      ids: descendantQuestionTemplateIds
    })
    .execute();

  const pageNosData: {
    pageNo: number;
    questionTemplateId: number;
    displayPage: number;
  }[] = await getRepository(PageTemplate)
    .createQueryBuilder("pageTemplate")
    .where("pageTemplate.discardedAt IS NULL")
    .innerJoin("pageTemplate.pageQuestionTemplates", "pageQuestionTemplate")
    .andWhere("pageQuestionTemplate.questionTemplateId IN (:...ids)", {
      ids: descendantQuestionTemplateIds
    })
    .innerJoin(
      "pageQuestionTemplate.questionTemplate",
      "questionTemplate",
      "questionTemplate.discardedAt IS NULL"
    )
    .select("pageTemplate.pageNo", "pageNo")
    .addSelect("questionTemplate.id", "questionTemplateId")
    .addSelect("questionTemplate.displayPage", "displayPage")
    .getRawMany();

  const pageNos = chain(pageNosData)
    .uniqBy("pageNo")
    .map("pageNo")
    .value();
  const questionTemplateIdsByPageNos = chain(pageNosData)
    .groupBy("pageNo")
    .mapValues(value => value.map(value => value.questionTemplateId))
    .value();

  const questionTemplateIdsByDisplayPage = pageNosData.reduce(
    (collection, currentValue) => {
      const { displayPage, questionTemplateId } = currentValue;
      if (displayPage in collection) {
        collection[displayPage].add(questionTemplateId);
      } else {
        const set = new Set<number>();
        set.add(questionTemplateId);
        collection[displayPage] = set;
      }
      return collection;
    },
    {} as { [key: number]: Set<number> }
  );

  const pagesData: {
    id: number;
    pageNo: number;
    imageUrl: string;
    annotationId: number;
    layer: AnnotationLine[]; // not sure if this works
  }[] = await getRepository(Page)
    .createQueryBuilder("page")
    .where("page.discardedAt IS NULL")
    .andWhere("page.scriptId = :id", { id })
    .andWhere("page.pageNo IN (:...pageNos)", { pageNos })
    .leftJoin(
      "page.annotations",
      "annotation",
      "annotation.paperUserId = :paperUserId",
      { paperUserId: requester.id }
    )
    .select("page.id", "id")
    .addSelect("page.pageNo", "pageNo")
    .addSelect("page.imageUrl", "imageUrl")
    .addSelect("annotation.id", "annotationId")
    .addSelect("annotation.layer", "layer")
    .getRawMany();

  // prettier-ignore
  const pageById = pagesData.reduce<{[id: number]: Pick<PageViewData, "annotations" | "id" | "imageUrl" | "pageNo">}>(
    (collection, { id, pageNo, imageUrl, annotationId, layer }) => {
    if (annotationId === null || layer === null) {
      collection[id] = { id, pageNo, imageUrl, annotations: [] }
    } else if (!(id in collection)) {
      collection[id] = {
        id,
        pageNo,
        imageUrl,
        annotations: [{ id: annotationId, layer }]
      };
    } else {
      collection[id].annotations.push({ id: annotationId, layer });
    }

    return collection;
  }, {});

  const pages = Object.values(pageById).map(page => {
    // const questionTemplateIds = questionTemplateIdsByPageNos[page.pageNo];
    const questionTemplateIds = questionTemplateIdsByDisplayPage[page.pageNo];
    const questionIds: number[] = [];
    if (questionTemplateIds) {
      questions
        .filter(question =>
          questionTemplateIds.has(question.questionTemplateId)
        )
        .forEach(question => questionIds.push(question.id));
    }
    return { ...page, questionIds };
  });

  const data: ScriptViewData = {
    id,
    studentId,
    matriculationNumber,
    rootQuestionTemplate,
    questions,
    pages
  };

  response.status(200).json(data);
}

// given script and question template id, find the questions that i need
export async function markQuestionTemplate(
  request: Request,
  response: Response
) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;
  const { scriptId, rootQuestionTemplateId } = request.params;

  const script = await getRepository(Script)
    .createQueryBuilder("script")
    .where("script.id = :scriptId", { scriptId })
    .leftJoin("script.student", "student", "student.discardedAt IS NULL")
    .select("script.id", "id")
    .addSelect("script.paperId", "paperId")
    .addSelect("student.id", "studentId")
    .addSelect("student.matriculationNumber", "matriculationNumber")
    .getRawOne();
  if (!script) {
    response.sendStatus(404);
    return;
  }
  const { paperId, studentId, matriculationNumber } = script;

  const allowed = await allowedRequester(userId, paperId, PaperUserRole.Marker);
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { requester } = allowed;

  const rootQuestionTemplate = await getRepository(QuestionTemplate)
    .createQueryBuilder("questionTemplate")
    .where("questionTemplate.discardedAt IS NULL")
    .andWhere("questionTemplate.id = :rootQuestionTemplateId", {
      rootQuestionTemplateId
    })
    .innerJoin(
      "questionTemplate.allocations",
      "allocation",
      "allocation.paperUserId = :requesterId",
      { requesterId: requester.id }
    )
    .getOne();

  if (!rootQuestionTemplate) {
    response.sendStatus(404);
    return;
  }

  const descendantQuestionTemplates = await getTreeRepository(
    QuestionTemplate
  ).findDescendants(rootQuestionTemplate);
  const descendantQuestionTemplateIds = descendantQuestionTemplates
    .filter(descendant => !descendant.discardedAt)
    .map(descendant => descendant.id);

  const questionsQuery = getRepository(Question)
    .createQueryBuilder("question")
    .where("question.discardedAt IS NULL")
    .andWhere("question.scriptId = :scriptId", { scriptId })
    .andWhere("question.questionTemplateId IN (:...ids)", {
      ids: descendantQuestionTemplateIds
    })
    .innerJoin(
      "question.questionTemplate",
      "questionTemplate",
      "questionTemplate.discardedAt IS NULL"
    )
    .leftJoin("question.marks", "mark", "mark.discardedAt IS NULL");

  const questions: (QuestionViewData & {
    questionTemplateId: number;
    currentMarkerId: number | null;
    currentMarkerUpdatedAt: Date | null;
  })[] = await selectQuestionViewData(questionsQuery)
    // this is not necessary for frontend but its needed to calculate PageViewData
    .addSelect("questionTemplate.id", "questionTemplateId")
    .addSelect("question.currentMarkerId", "currentMarkerId")
    .addSelect("question.currentMarkerUpdatedAt", "currentMarkerUpdatedAt")
    .getRawMany();

  const canMark = questions.some(
    question =>
      !question.currentMarkerId ||
      !question.currentMarkerUpdatedAt ||
      question.currentMarkerId === requester.id ||
      question.currentMarkerUpdatedAt < addMinutes(new Date(), -30)
  );

  // Lock all the script's questions for the root template's descendants
  // Can't use questionsQuery because of the joins and the different syntax required (no using question.)
  await getRepository(Question)
    .createQueryBuilder("question")
    .update()
    .set({ currentMarker: requester, currentMarkerUpdatedAt: new Date() })
    .where("discardedAt IS NULL")
    .andWhere("scriptId = :scriptId", { scriptId })
    .andWhere("questionTemplateId IN (:...ids)", {
      ids: descendantQuestionTemplateIds
    })
    .execute();

  const pageNosData: {
    pageNo: number;
    questionTemplateId: number;
    displayPage: number;
  }[] = await getRepository(PageTemplate)
    .createQueryBuilder("pageTemplate")
    .where("pageTemplate.discardedAt IS NULL")
    .innerJoin("pageTemplate.pageQuestionTemplates", "pageQuestionTemplate")
    .andWhere("pageQuestionTemplate.questionTemplateId IN (:...ids)", {
      ids: descendantQuestionTemplateIds
    })
    .innerJoin(
      "pageQuestionTemplate.questionTemplate",
      "questionTemplate",
      "questionTemplate.discardedAt IS NULL"
    )
    .select("pageTemplate.pageNo", "pageNo")
    .addSelect("questionTemplate.id", "questionTemplateId")
    .addSelect("questionTemplate.displayPage", "displayPage")
    .getRawMany();

  const pageNos = chain(pageNosData)
    .uniqBy("pageNo")
    .map("pageNo")
    .value();

  const questionTemplateIdsByDisplayPage = pageNosData.reduce(
    (collection, currentValue) => {
      const { displayPage, questionTemplateId } = currentValue;
      if (displayPage in collection) {
        collection[displayPage].add(questionTemplateId);
      } else {
        const set = new Set<number>();
        set.add(questionTemplateId);
        collection[displayPage] = set;
      }
      return collection;
    },
    {} as { [key: number]: Set<number> }
  );

  const pagesData: {
    id: number;
    pageNo: number;
    imageUrl: string;
    annotationId: number;
    layer: AnnotationLine[]; // not sure if this works
  }[] = await getRepository(Page)
    .createQueryBuilder("page")
    .where("page.discardedAt IS NULL")
    .andWhere("page.scriptId = :scriptId", { scriptId })
    .andWhere("page.pageNo IN (:...pageNos)", { pageNos })
    .leftJoin(
      "page.annotations",
      "annotation",
      "annotation.paperUserId = :paperUserId",
      { paperUserId: requester.id }
    )
    .select("page.id", "id")
    .addSelect("page.pageNo", "pageNo")
    .addSelect("page.imageUrl", "imageUrl")
    .addSelect("annotation.id", "annotationId")
    .addSelect("annotation.layer", "layer")
    .getRawMany();

  // prettier-ignore
  const pageById = pagesData.reduce<{[id: number]: Pick<PageViewData, "annotations" | "id" | "imageUrl" | "pageNo">}>(
      (collection, { id, pageNo, imageUrl, annotationId, layer }) => {
      if (annotationId === null || layer === null) {
        collection[id] = { id, pageNo, imageUrl, annotations: [] }
      } else if (!(id in collection)) {
        collection[id] = {
          id,
          pageNo,
          imageUrl,
          annotations: [{ id: annotationId, layer }]
        };
      } else {
        collection[id].annotations.push({ id: annotationId, layer });
      }
  
      return collection;
    }, {});

  const pages = Object.values(pageById).map(page => {
    // const questionTemplateIds = questionTemplateIdsByPageNos[page.pageNo];
    const questionTemplateIds = questionTemplateIdsByDisplayPage[page.pageNo];
    const questionIds: number[] = [];
    if (questionTemplateIds) {
      questions
        .filter(question =>
          questionTemplateIds.has(question.questionTemplateId)
        )
        .forEach(question => questionIds.push(question.id));
    }
    return { ...page, questionIds };
  });

  const data: ScriptViewData = {
    id: Number(scriptId),
    studentId,
    matriculationNumber,
    pages,
    questions,
    rootQuestionTemplate,
    canMark
  };

  response.status(200).json(data);
}

export async function nextScriptToMark(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;
  const questionTemplateId = Number(request.params.id);
  const questionTemplate = await getRepository(QuestionTemplate)
    .createQueryBuilder("questionTemplate")
    .where("questionTemplate.id = :questionTemplateId", { questionTemplateId })
    .andWhere("questionTemplate.discardedAt IS NULL")
    .innerJoinAndMapOne(
      "questionTemplate.scriptTemplate",
      "questionTemplate.scriptTemplate",
      "scriptTemplate",
      "scriptTemplate.discardedAt IS NULL"
    )
    .getOne();
  if (!questionTemplate) {
    response.sendStatus(404);
    return;
  }
  const { paperId } = questionTemplate.scriptTemplate!;

  const allowed = await allowedRequester(userId, paperId, PaperUserRole.Marker);
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
    .andWhere("questionTemplate.parentQuestionTemplateId IS NULL")
    .andWhere("questionTemplate.discardedAt IS NULL")
    .innerJoin(
      "questionTemplate.allocations",
      "allocation",
      "allocation.paperUserId = :paperUserId",
      { paperUserId: requester.id }
    )
    .getOne();
  if (!rootQuestionTemplate) {
    response.sendStatus(404);
    return;
  }

  const descendantQuestionTemplates = await getTreeRepository(
    QuestionTemplate
  ).findDescendants(rootQuestionTemplate);
  const descendantQuestionTemplateIds = descendantQuestionTemplates
    .filter(descendant => !descendant.discardedAt)
    .map(descendant => descendant.id);

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
          qb.where("question.currentMarkerId IS NULL")
            .orWhere("question.currentMarkerId = :id", { id: requester.id })
            // Prevent other markers from accessing this route for the next 30 minutes
            .orWhere("question.currentMarkerUpdatedAt < :date", {
              date: addMinutes(new Date(), -30)
            });
        })
      )
      .innerJoin("question.script", "script", "script.discardedAt IS NULL")
      .innerJoin(
        "question.questionTemplate",
        "questionTemplate",
        "questionTemplate.discardedAt IS NULL"
      )
      .leftJoin("question.marks", "mark", "mark.discardedAt IS NULL")
      .andWhere("mark IS NULL")
      .select("script.id", "id")
      .getRawOne();
  }
  if (!script) {
    response.sendStatus(204);
    return;
  }
  const data = {
    scriptId: script.id,
    rootQuestionTemplateId: rootQuestionTemplate.id
  };
  response.status(200).json(data);
}
