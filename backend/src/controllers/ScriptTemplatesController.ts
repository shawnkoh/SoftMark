import { validate, validateOrReject } from "class-validator";
import { Request, Response } from "express";
import _ from "lodash";
import {
  getManager,
  getRepository,
  getTreeRepository,
  IsNull,
  SelectQueryBuilder
} from "typeorm";
import { PageTemplate } from "../entities/PageTemplate";
import QuestionTemplate from "../entities/QuestionTemplate";
import { ScriptTemplate } from "../entities/ScriptTemplate";
import { PaperUserRole } from "../types/paperUsers";
import {
  ScriptTemplatePostData,
  ScriptTemplateSetupData
} from "../types/scriptTemplates";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester, allowedRequesterOrFail } from "../utils/papers";
import { cleanTrees } from "../utils/questionTemplate";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const paperId = Number(request.params.id);
  const { imageUrls, sha256 } = _.pick(
    request.body,
    "imageUrls",
    "sha256"
  ) as ScriptTemplatePostData;
  const allowed = await allowedRequester(
    requesterId,
    paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    return response.sendStatus(404);
  }

  const activeScriptTemplate = await getRepository(ScriptTemplate).findOne({
    paperId,
    discardedAt: IsNull()
  });

  const existingScriptTemplate = await getRepository(ScriptTemplate).findOne({
    paperId,
    sha256
  });

  if (
    activeScriptTemplate &&
    existingScriptTemplate &&
    activeScriptTemplate.id === existingScriptTemplate.id
  ) {
    return response.sendStatus(204);
  }

  if (activeScriptTemplate) {
    activeScriptTemplate.discardedAt = new Date();
    await getRepository(ScriptTemplate).save(activeScriptTemplate);
  }

  if (existingScriptTemplate) {
    existingScriptTemplate.discardedAt = null;
    await getRepository(ScriptTemplate).save(existingScriptTemplate);
    const data = await existingScriptTemplate.getData();
    response.status(200).json({ scriptTemplate: data });
    return;
  }

  const scriptTemplate = new ScriptTemplate(paperId, sha256);
  const errors = await validate(scriptTemplate);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }

  let pageTemplates: PageTemplate[];
  try {
    pageTemplates = await Promise.all(
      imageUrls.map(
        async (imageUrl: string, index: number): Promise<PageTemplate> => {
          const pageTemplate = new PageTemplate(
            scriptTemplate,
            imageUrl,
            index + 1
          );
          await validateOrReject(pageTemplate);
          return pageTemplate;
        }
      )
    );
  } catch (error) {
    response.sendStatus(400);
    return;
  }

  await getManager().transaction(async manager => {
    await manager.save(scriptTemplate);
    await Promise.all(
      pageTemplates.map(async pageTemplate => await manager.save(pageTemplate))
    );
  });

  await getRepository(ScriptTemplate).save(scriptTemplate);

  const data = await scriptTemplate.getData();
  response.status(201).json({ scriptTemplate: data });
}

export async function showActive(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const paperId = request.params.id;
  const allowed = await allowedRequester(
    payload.userId,
    paperId,
    PaperUserRole.Student
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { paper } = allowed;

  try {
    const scriptTemplate = await getRepository(ScriptTemplate).findOne({
      where: { paper, discardedAt: IsNull() },
      relations: ["pageTemplates", "questionTemplates"]
    });

    const data = scriptTemplate ? await scriptTemplate.getData() : null;
    response.status(200).json({ scriptTemplate: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const scriptTemplateId = Number(request.params.id);
  let scriptTemplate: ScriptTemplate;
  try {
    scriptTemplate = await getRepository(ScriptTemplate).findOneOrFail(
      scriptTemplateId
    );
    await allowedRequesterOrFail(
      payload.userId,
      scriptTemplate.paperId,
      PaperUserRole.Owner
    );
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    await getRepository(ScriptTemplate).update(scriptTemplateId, {
      discardedAt: new Date()
    });
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}

// TODO: Discard the other script templates
export async function undiscard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const scriptTemplateId = Number(request.params.id);
  let scriptTemplate: ScriptTemplate;
  try {
    scriptTemplate = await getRepository(ScriptTemplate).findOneOrFail(
      scriptTemplateId
    );
    await allowedRequesterOrFail(
      payload.userId,
      scriptTemplate.paperId,
      PaperUserRole.Owner
    );
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    await getRepository(ScriptTemplate).update(scriptTemplateId, {
      discardedAt: null
    });

    const data = scriptTemplate.getData();
    response.status(200).json({ scriptTemplate: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function getSetupData(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = Number(payload.userId);
  const paperId = Number(request.params.id);
  const allowed = await allowedRequester(
    requesterId,
    paperId,
    PaperUserRole.Owner
  );
  const scriptTemplate = await getRepository(ScriptTemplate)
    .createQueryBuilder("scriptTemplate")
    .where("scriptTemplate.discardedAt IS NULL")
    .innerJoin("scriptTemplate.paper", "paper", "paper.discardedAt IS NULL")
    .andWhere("paper.id = :paperId", { paperId })
    .getOne();
  if (!scriptTemplate) {
    response.sendStatus(404);
    return;
  }
  const scriptTemplateId = scriptTemplate.id;
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  const trees = await getTreeRepository(QuestionTemplate).findTrees();
  const questionTemplates = cleanTrees(
    trees.filter(
      tree => !tree.discardedAt && tree.scriptTemplateId === scriptTemplateId
    )
  );

  const pageTemplatesData = await getRepository(PageTemplate)
    .createQueryBuilder("pageTemplate")
    .where("pageTemplate.scriptTemplateId = :id", { id: scriptTemplateId })
    .andWhere("pageTemplate.discardedAt IS NULL")
    .select("pageTemplate.id", "id")
    .addSelect("pageTemplate.pageNo", "pageNo")
    .addSelect("pageTemplate.imageUrl", "imageUrl")
    .getRawMany();

  const pageTemplates = await Promise.all(
    pageTemplatesData.map(async pageTemplate => {
      const queryBuilder = getTreeRepository(QuestionTemplate)
        .createQueryBuilder("questionTemplate")
        .where("questionTemplate.displayPage IS NOT NULL")
        .where("questionTemplate.discardedAt IS NULL")
        .innerJoin(
          "questionTemplate.pageQuestionTemplates",
          "pageQuestionTemplate",
          "pageQuestionTemplate.discardedAt IS NULL AND pageQuestionTemplate.pageTemplateId = :id",
          { id: pageTemplate.id }
        );

      const questionTemplates = await selectQuestionTemplateLeafData(
        queryBuilder
      ).getRawMany();

      return { ...pageTemplate, questionTemplates };
    })
  );

  const data: ScriptTemplateSetupData = {
    id: scriptTemplateId,
    pageTemplates,
    questionTemplates
  };

  response.status(200).json(data);
}

function selectQuestionTemplateLeafData(
  queryBuilder: SelectQueryBuilder<QuestionTemplate>
) {
  return queryBuilder
    .select("questionTemplate.id", "id")
    .addSelect("questionTemplate.name", "name")
    .addSelect("questionTemplate.score", "score")
    .addSelect("questionTemplate.displayPage", "displayPage")
    .addSelect("questionTemplate.topOffset", "topOffset")
    .addSelect("questionTemplate.leftOffset", "leftOffset")
    .addSelect("questionTemplate.pageCovered", "pageCovered");
}
