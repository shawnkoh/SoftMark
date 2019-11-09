import { validate, validateOrReject } from "class-validator";
import { addMinutes } from "date-fns";
import { Request, Response } from "express";
import { pick } from "lodash";
import { Brackets, getManager, getRepository, IsNull, Not } from "typeorm";
import { PageQuestionTemplate } from "../entities/PageQuestionTemplate";
import { Question } from "../entities/Question";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { Script } from "../entities/Script";
import { ScriptTemplate } from "../entities/ScriptTemplate";
import { isAllocated } from "../middlewares/canModifyMark";
import { PaperUserRole } from "../types/paperUsers";
import {
  QuestionTemplatePatchData,
  QuestionTemplatePostData
} from "../types/questionTemplates";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester, allowedRequesterOrFail } from "../utils/papers";
import { generatePages, isPageValid } from "../utils/questionTemplate";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const scriptTemplateId = request.params.id;
  const postData = pick(
    request.body,
    "name",
    "parentName",
    "score",
    "pageCovered"
  ) as QuestionTemplatePostData;

  const scriptTemplate = await getRepository(ScriptTemplate).findOne(
    scriptTemplateId,
    { where: { discardedAt: IsNull() } }
  );
  if (!scriptTemplate) {
    response.sendStatus(404);
    return;
  }
  const allowed = await allowedRequester(
    requesterId,
    scriptTemplate.paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { paper } = allowed;

  const questionTemplate = new QuestionTemplate(
    scriptTemplate,
    postData.name,
    postData.score,
    50,
    50
  );
  if (postData.parentName) {
    const parent = await getRepository(QuestionTemplate).findOne({
      where: { paper, name: postData.parentName }
    });
    if (!parent) {
      response.sendStatus(400);
      return;
    }
    questionTemplate.parentQuestionTemplate = parent;
  }
  const errors = await validate(questionTemplate);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }

  // create Question for all the Paper's Scripts
  const scripts = await getRepository(Script).find({ paper });
  const questions = scripts.map(
    script => new Question(script, questionTemplate)
  );

  if (
    postData.pageCovered &&
    scriptTemplate.pageTemplates &&
    isPageValid(postData.pageCovered, scriptTemplate.pageTemplates.length)
  ) {
    const pageNos = generatePages(postData.pageCovered);
    questionTemplate.pageQuestionTemplates = scriptTemplate.pageTemplates
      .filter(value => pageNos.has(value.pageNo))
      .map(value => new PageQuestionTemplate(value, questionTemplate));
  }

  await getManager().transaction(async manager => {
    await manager.save(questionTemplate);
    await manager.save(questions);
  });

  const data = await questionTemplate.getData();
  response.status(201).json({ questionTemplate: data });
}

export async function show(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const questionTemplateId = request.params.id;
  let questionTemplate: QuestionTemplate;
  try {
    questionTemplate = await getRepository(QuestionTemplate).findOneOrFail(
      questionTemplateId,
      {
        where: { discardedAt: IsNull() },
        relations: [
          "scriptTemplate",
          "pageQuestionTemplates",
          "pageQuestionTemplates.pageTemplate"
        ]
      }
    );
    await allowedRequesterOrFail(
      requesterId,
      questionTemplate.scriptTemplate!.paperId,
      PaperUserRole.Student
    );
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    const data = await questionTemplate.getData();
    response.status(200).json({ questionTemplate: data });
  } catch (error) {
    response.sendStatus(500);
  }
}

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const questionTemplateId = request.params.id;
  const patchData = pick(
    request.body,
    "name",
    "parentName",
    "score",
    "leftOffset",
    "topOffset",
    "pageCovered"
  ) as QuestionTemplatePatchData;

  let questionTemplate: QuestionTemplate;
  try {
    questionTemplate = await getRepository(QuestionTemplate).findOneOrFail(
      questionTemplateId,
      { where: { discardedAt: IsNull() }, relations: ["scriptTemplate"] }
    );
    await allowedRequesterOrFail(
      requesterId,
      questionTemplate.scriptTemplate!.paperId,
      PaperUserRole.Owner
    );
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    if (patchData.parentName) {
      const parent = await getRepository(QuestionTemplate).findOneOrFail({
        where: { name: patchData.parentName }
      });
      questionTemplate.parentQuestionTemplate = parent;
    }
    if (questionTemplate.scriptTemplate && patchData.pageCovered) {
      const pageTemplates = questionTemplate.scriptTemplate.pageTemplates;
      if (
        pageTemplates &&
        isPageValid(patchData.pageCovered, pageTemplates.length)
      ) {
        const pageNos = generatePages(patchData.pageCovered);
        questionTemplate.pageQuestionTemplates = pageTemplates
          .filter(value => pageNos.has(value.pageNo))
          .map(value => new PageQuestionTemplate(value, questionTemplate));
      }
    }
    Object.assign(questionTemplate, patchData);
    await validateOrReject(questionTemplate);

    await getRepository(QuestionTemplate).save(questionTemplate);

    const data = await questionTemplate.getData();
    response.status(200).json({ questionTemplate: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const questionTemplateId = request.params.id;
  const questionTemplate = await getRepository(QuestionTemplate).findOne(
    questionTemplateId,
    {
      where: { discardedAt: IsNull() },
      relations: ["scriptTemplate"]
    }
  );
  if (!questionTemplate) {
    response.sendStatus(404);
    return;
  }
  const allowed = await allowedRequester(
    requesterId,
    questionTemplate.scriptTemplate!.paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  await getRepository(QuestionTemplate).update(questionTemplateId, {
    discardedAt: new Date()
  });

  response.sendStatus(204);
}

export async function undiscard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const questionTemplateId = request.params.id;
  const questionTemplate = await getRepository(QuestionTemplate).findOne(
    questionTemplateId,
    {
      where: { discardedAt: Not(IsNull()) },
      relations: ["scriptTemplate"]
    }
  );
  if (!questionTemplate) {
    response.sendStatus(404);
    return;
  }
  const allowed = await allowedRequester(
    requesterId,
    questionTemplate.scriptTemplate!.paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  questionTemplate.discardedAt = null;
  const errors = await validate(questionTemplate);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(QuestionTemplate).save(questionTemplate);

  const data = await questionTemplate.getData();
  response.status(200).json({ questionTemplate: data });
}

/**
 * MVP Key Assumptions
 * 1. This is currently only intended for parent questions. It will not inherit parent questions
 */
export async function markQuestion(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const questionTemplateId = request.params.id;
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
  const question = await getRepository(Question)
    .createQueryBuilder("question")
    .leftJoin("question.marks", "mark")
    .where("question.discardedAt IS NULL")
    .andWhere("question.questionTemplateId = :questionTemplateId", {
      questionTemplateId
    })
    .andWhere(
      new Brackets(qb => {
        qb.where("question.currentMarker IS NULL")
        .orWhere("question.currentMarkerId = :id", { id: requester.id })
        // Prevent other markers from accessing this route for the next 30 minutes
        .orWhere("question.currentMarkerUpdatedAt < :date", { date: addMinutes(new Date(), -30) });
      })
    )
    .andWhere(
      new Brackets(qb => {
        qb.where("mark IS NULL")
        .orWhere("mark.discardedAt IS NOT NULL");
      })
    )
    .getOne();

  if (!question) {
    response.sendStatus(204);
    return;
  }

  // Prevent other markers from accessing this route for the next 30 minutes
  question.currentMarker = requester;
  question.currentMarkerUpdatedAt = new Date();
  const errors = await validate(question);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(Question).save(question);

  // load nested data

  const questionData = await question.getData();
  response.status(200).json({ question: questionData });
}
