import { validate, validateOrReject } from "class-validator";
import { Request, Response } from "express";
import _ from "lodash";
import {
  getManager,
  getRepository,
  getTreeRepository,
  IsNull,
  Not,
  createQueryBuilder
} from "typeorm";
import { Allocation } from "../entities/Allocation";
import { Mark } from "../entities/Mark";
import { PageQuestionTemplate } from "../entities/PageQuestionTemplate";
import { Question } from "../entities/Question";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { Script } from "../entities/Script";
import { ScriptTemplate } from "../entities/ScriptTemplate";
import { PaperUserRole } from "../types/paperUsers";
import {
  QuestionTemplateGradingListData,
  QuestionTemplatePatchData,
  QuestionTemplatePostData,
  QuestionTemplateRootData
} from "../types/questionTemplates";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester, allowedRequesterOrFail } from "../utils/papers";
import { generatePages, isPageValid } from "../utils/questionTemplate";

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
    const scripts = await getRepository(Script).find({ paper });
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

export async function index(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const paperId = Number(request.params.id);
  let questionTemplates: QuestionTemplate[] = [];
  try {
    await allowedRequesterOrFail(requesterId, paperId, PaperUserRole.Student);
    questionTemplates = await getActiveQuestionTemplates(paperId);
  } catch (error) {
    return response.sendStatus(404);
  }

  try {
    const data = await Promise.all(
      questionTemplates.map(questionTemplate => questionTemplate.getData())
    );
    response.status(200).json({ questionTemplates: data });
  } catch (error) {
    return response.sendStatus(500);
  }
}

export async function getRootQuestionTemplates(
  request: Request,
  response: Response
) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const paperId = Number(request.params.id);
  let rootQuestionTemplates: QuestionTemplate[] = [];
  try {
    await allowedRequesterOrFail(requesterId, paperId, PaperUserRole.Student);
    rootQuestionTemplates = (await getActiveQuestionTemplates(paperId)).filter(
      questionTemplate => !questionTemplate.parentQuestionTemplateId
    );
  } catch (error) {
    return response.sendStatus(404);
  }

  try {
    const data = await Promise.all(
      rootQuestionTemplates.map(questionTemplate => questionTemplate.getData())
    );
    response.status(200).json({ questionTemplates: data });
  } catch (error) {
    return response.sendStatus(500);
  }
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
  const scripts = await getRepository(Script).find({ paper });
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

export async function getActiveQuestionTemplates(paperId: number) {
  const scriptTemplate = await getRepository(ScriptTemplate).findOneOrFail({
    where: { paperId, discardedAt: IsNull() },
    relations: ["questionTemplates"]
  });
  return await getRepository(QuestionTemplate).find({
    where: { scriptTemplateId: scriptTemplate.id, discardedAt: IsNull() }
  });
}

export async function rootQuestionTemplates(
  request: Request,
  response: Response
) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const scriptTemplateId = request.params.id;
  const scriptTemplate = await getRepository(ScriptTemplate).findOne(
    scriptTemplateId,
    { where: { discardedAt: IsNull() } }
  );
  if (!scriptTemplate) {
    response.sendStatus(404);
    return;
  }
  const { paperId } = scriptTemplate;
  const allowed = allowedRequester(requesterId, paperId, PaperUserRole.Marker);
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  let totalMarkCount = 0;
  let totalQuestionCount = 0;
  let aggregateMarkers: any[] = [];

  // TODO: I think this can be optimised into one query using group by
  const rawRoots = await getTreeRepository(QuestionTemplate)
    .createQueryBuilder("questionTemplate")
    .where("questionTemplate.discardedAt IS NULL")
    .andWhere("questionTemplate.parentQuestionTemplateId IS NULL")
    .innerJoin(
      "questionTemplate.scriptTemplate",
      "scriptTemplate",
      "scriptTemplate.paperId = :id and scriptTemplate.discardedAt IS NULL",
      { id: paperId }
    )
    .select("questionTemplate.id", "id")
    .addSelect("questionTemplate.name", "name")
    .getRawMany();

  const roots = await Promise.all(
    rawRoots.map(async rawRoot => {
      const descendants = await getTreeRepository(
        QuestionTemplate
      ).findDescendants(rawRoot);
      const descendantIds = descendants.map(descendant => descendant.id);

      let totalScore = 0;
      let questionCount = 0;
      descendants.forEach(descendant => {
        if (descendant.score) {
          totalScore += descendant.score;
          questionCount++;
        }
      });
      totalQuestionCount += questionCount;

      let markers: any = await getRepository(Allocation)
        .createQueryBuilder("allocation")
        .where("allocation.questionTemplateId IN (:...ids)", {
          ids: descendantIds
        })
        .innerJoin("allocation.paperUser", "marker")
        .innerJoin("marker.user", "user")
        .select("user.id", "id")
        .addSelect("user.email", "email")
        .addSelect("user.emailVerified", "emailVerified")
        .addSelect("user.name", "name")
        .getRawMany();
      markers.forEach((marker: any) => {
        aggregateMarkers.push(marker);
      });

      markers = _.chain(markers)
        .map(marker => marker.id)
        .sortedUniq();

      const questions = await getRepository(Question)
        .createQueryBuilder("question")
        .where("question.discardedAt IS NULL")
        .andWhere("question.questionTemplateId IN (:...ids)", {
          ids: descendantIds
        })
        .select("question.id")
        .getRawMany();
      const questionIds = questions.map(question => question.id);

      const markCount =
        questionIds.length > 0
          ? await getRepository(Mark)
              .createQueryBuilder("mark")
              .where("mark.questionId IN (:...ids)", { ids: questionIds })
              .getCount()
          : 0;
      totalMarkCount += markCount;

      const root: QuestionTemplateRootData = {
        id: rawRoot.id,
        name: rawRoot.name,
        totalScore,
        markers,
        markCount,
        questionCount
      };
      return root;
    })
  );

  aggregateMarkers = _.uniqBy(aggregateMarkers, marker => marker.id);

  const data: QuestionTemplateGradingListData = {
    rootQuestionTemplates: roots,
    totalQuestionCount,
    totalMarkCount,
    markers: aggregateMarkers
  };

  response.status(200).json(data);
}
