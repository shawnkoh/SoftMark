import { validate, validateOrReject } from "class-validator";
import { Request, Response } from "express";
import _ from "lodash";
import {
  createQueryBuilder,
  getManager,
  getRepository,
  getTreeRepository,
  IsNull,
  Not
} from "typeorm";
import { PageQuestionTemplate } from "../entities/PageQuestionTemplate";
import { Question } from "../entities/Question";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { Script } from "../entities/Script";
import { ScriptTemplate } from "../entities/ScriptTemplate";
import { PaperUserRole } from "../types/paperUsers";
import {
  QuestionTemplatePatchData,
  QuestionTemplatePostData
} from "../types/questionTemplates";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester, allowedRequesterOrFail } from "../utils/papers";
import { generatePages, isPageValid } from "../utils/questionTemplate";
import { sortRootQuestionTemplates } from "../utils/sorts";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const scriptTemplateId = request.params.id;
  const postData = _.pick(
    request.body,
    "displayPage",
    "name",
    "pageCovered",
    "parentQuestionTemplateId",
    "score"
  ) as QuestionTemplatePostData;

  const {
    displayPage,
    name,
    pageCovered,
    parentQuestionTemplateId,
    score
  } = postData;

  const scriptTemplate = await getRepository(ScriptTemplate).findOne(
    scriptTemplateId,
    { where: { discardedAt: IsNull() }, relations: ["pageTemplates"] }
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

  let parentQuestionTemplate = null;
  if (parentQuestionTemplateId) {
    parentQuestionTemplate = await getRepository(QuestionTemplate).findOne(
      parentQuestionTemplateId
    );
    if (!parentQuestionTemplate) {
      response.sendStatus(404);
      return;
    }
  }

  const questionTemplate = new QuestionTemplate(
    scriptTemplate,
    name,
    score,
    pageCovered,
    displayPage,
    displayPage ? 50 : null,
    displayPage ? 50 : null,
    parentQuestionTemplate
  );
  const errors = await validate(questionTemplate);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }

  // create Question for all the Paper's Scripts if the questionTemplate is a leaf
  let questions: Question[] = [];
  if (displayPage) {
    const scripts = await getRepository(Script).find({
      paper,
      discardedAt: IsNull()
    });
    questions = scripts.map(script => new Question(script, questionTemplate));
  }

  let pageQuestionTemplates: PageQuestionTemplate[] = [];
  if (
    pageCovered &&
    scriptTemplate.pageTemplates &&
    isPageValid(pageCovered, scriptTemplate.pageTemplates.length)
  ) {
    const pageNos = generatePages(pageCovered);
    const coveredPageTemplates = scriptTemplate.pageTemplates.filter(value =>
      pageNos.has(value.pageNo)
    );
    pageQuestionTemplates = coveredPageTemplates.map(
      v => new PageQuestionTemplate(v, questionTemplate)
    );
  }

  await getManager().transaction(async manager => {
    await manager.save(questionTemplate);
    await manager.save(questions);
    await manager.save(pageQuestionTemplates);
  });

  const data = questionTemplate.getData();
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
    const data = questionTemplate.getData();
    response.status(200).json({ questionTemplate: data });
  } catch (error) {
    response.sendStatus(500);
  }
}

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const questionTemplateId = request.params.id;
  const patchData = _.pick(
    request.body,
    "leftOffset",
    "name",
    "pageCovered",
    "parentQuestionTemplateId",
    "score",
    "topOffset"
  ) as QuestionTemplatePatchData;

  const {
    leftOffset,
    name,
    pageCovered,
    parentQuestionTemplateId,
    score,
    topOffset
  } = patchData;

  let parentQuestionTemplate = null;
  if (parentQuestionTemplateId) {
    parentQuestionTemplate = await getRepository(QuestionTemplate).findOne(
      parentQuestionTemplateId
    );
    if (!parentQuestionTemplate) {
      response.sendStatus(404);
      return;
    }
  }

  let questionTemplate: QuestionTemplate;
  try {
    questionTemplate = await getRepository(QuestionTemplate).findOneOrFail(
      questionTemplateId,
      {
        where: { discardedAt: IsNull() },
        relations: ["scriptTemplate", "scriptTemplate.pageTemplates"]
      }
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
    if (name) questionTemplate.name = name;
    if (topOffset) questionTemplate.topOffset = topOffset;
    if (leftOffset) questionTemplate.leftOffset = leftOffset;
    if (score) questionTemplate.score = score;
    if (parentQuestionTemplate)
      questionTemplate.parentQuestionTemplate = parentQuestionTemplate;
    if (questionTemplate.scriptTemplate && pageCovered) {
      questionTemplate.pageCovered = pageCovered;
      const pageTemplates = questionTemplate.scriptTemplate.pageTemplates;
      if (pageTemplates && isPageValid(pageCovered, pageTemplates.length)) {
        const pageNos = generatePages(pageCovered);
        const coveredPageTemplates = pageTemplates.filter(value =>
          pageNos.has(value.pageNo)
        );
        await createQueryBuilder(PageQuestionTemplate, "pqt")
          .delete()
          .where("questionTemplateId = :questionTemplateId", {
            questionTemplateId: questionTemplate.id
          })
          .execute();
        questionTemplate.pageQuestionTemplates = coveredPageTemplates.map(
          v => new PageQuestionTemplate(v, questionTemplate)
        );
      }
    }
    await validateOrReject(questionTemplate);

    await getRepository(QuestionTemplate).save(questionTemplate);

    const data = questionTemplate.getData();
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

  const { paper } = allowed;
  const scripts = await getRepository(Script).find({
    paper,
    discardedAt: IsNull()
  });
  const descendants = await getTreeRepository(QuestionTemplate).findDescendants(
    questionTemplate
  );

  // Delete descedant question templates and the questions linked to them.
  descendants.forEach(async d => {
    scripts.forEach(async script => {
      await getRepository(Question).update(
        { script, questionTemplate: d },
        {
          discardedAt: new Date()
        }
      );
    });
    await getRepository(QuestionTemplate).update(d.id, {
      discardedAt: new Date()
    });
  });

  scripts.forEach(async script => {
    await getRepository(Question).update(
      { script, questionTemplate },
      {
        discardedAt: new Date()
      }
    );
  });

  await getRepository(QuestionTemplate).update(questionTemplate.id, {
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

  const data = questionTemplate.getData();
  response.status(200).json({ questionTemplate: data });
}

// TODO: This function should return all the data needed for http://localhost:3000/papers/1/setup/allocate
export async function rootQuestionTemplates(
  request: Request,
  response: Response
) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const paperId = request.params.id;
  const allowed = allowedRequester(requesterId, paperId, PaperUserRole.Marker);
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  const rootQuestionTemplates = await getRepository(QuestionTemplate)
    .createQueryBuilder("questionTemplate")
    .innerJoin(
      "questionTemplate.scriptTemplate",
      "scriptTemplate",
      "scriptTemplate.discardedAt IS NULL"
    )
    .where("scriptTemplate.paperId = :paperId", { paperId })
    .andWhere("questionTemplate.discardedAt IS NULL")
    .andWhere("questionTemplate.parentQuestionTemplateId IS NULL")
    .getMany();

  const sortedRootQuestionTemplates = await sortRootQuestionTemplates(
    rootQuestionTemplates
  );

  const rootQuestionTemplateData = await Promise.all(
    sortedRootQuestionTemplates.map(async rootQuestionTemplate => {
      const descendants: QuestionTemplate[] = await getTreeRepository(
        QuestionTemplate
      ).findDescendants(rootQuestionTemplate);
      const rootQuestionTemplateScore = rootQuestionTemplate.score || 0;
      rootQuestionTemplate.score =
        rootQuestionTemplateScore +
        descendants
          .map(QuestionTemplate => QuestionTemplate.score || 0)
          .reduce((a, b) => a + b, 0);
      return rootQuestionTemplate;
    })
  );

  const data = { rootQuestionTemplates: rootQuestionTemplateData };

  response.status(200).json(data);
}
