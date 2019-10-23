import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository, getManager, IsNull } from "typeorm";
import { pick } from "lodash";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { ScriptTemplate } from "../entities/ScriptTemplate";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { getEntityArray } from "../utils/entities";
import { allowedPaperUser, allowedOrFail } from "../utils/papers";
import { ScriptTemplatePatchData } from "../types/scriptTemplates";
import { isQuestionTemplatePatchData } from "../types/questionTemplates";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const paperId = request.params.id;
  try {
    const allowed = await allowedPaperUser(
      payload.id,
      paperId,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }
    const { paper } = allowed;

    const scriptTemplate = new ScriptTemplate();
    scriptTemplate.paperId = paper.id;
    const questionTemplates = await getEntityArray(
      request.body.questionTemplates,
      QuestionTemplate,
      { scriptTemplate }
    );

    await getManager().transaction(async manager => {
      await manager.save(scriptTemplate);
      await manager.save(questionTemplates);
    });
    const data = await scriptTemplate.getData();
    response.status(201).send(data);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function show(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const paperId = request.params.id;
  try {
    const allowed = await allowedPaperUser(payload.id, paperId);
    if (!allowed) {
      response.sendStatus(404);
      return;
    }
    const { paper, paperUser } = allowed;
    const scriptTemplate = await getRepository(ScriptTemplate).findOneOrFail({
      where: { paperId: paper.id, discardedAt: IsNull() }
    });

    const data = await scriptTemplate.getData();
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const scriptTemplateId = Number(request.params.id);
  let scriptTemplate: ScriptTemplate;
  try {
    scriptTemplate = await getRepository(ScriptTemplate).findOneOrFail(
      scriptTemplateId
    );
    await allowedOrFail(
      payload.id,
      scriptTemplate.paperId,
      PaperUserRole.Owner
    );
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    const { questionTemplates } = request.body as ScriptTemplatePatchData;
    const entities = await Promise.all(
      questionTemplates.map(async data => {
        let entity: QuestionTemplate;
        if (isQuestionTemplatePatchData(data)) {
          entity = await getRepository(QuestionTemplate).findOneOrFail(
            data.id,
            {
              where: { scriptTemplate }
            }
          );
        } else {
          entity = new QuestionTemplate();
        }
        entity.scriptTemplate = scriptTemplate;
        Object.assign(entity, pick(data, "name", "marks"));
        await validateOrReject(entity);
        return entity;
      })
    );

    await getRepository(QuestionTemplate).save(entities);

    const data = await scriptTemplate.getData();
    response.status(200).json(data);
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
    await allowedOrFail(
      payload.id,
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

export async function undiscard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const scriptTemplateId = Number(request.params.id);
  let scriptTemplate: ScriptTemplate;
  try {
    scriptTemplate = await getRepository(ScriptTemplate).findOneOrFail(
      scriptTemplateId
    );
    await allowedOrFail(
      payload.id,
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
    response.status(200).send(data);
  } catch (error) {
    response.sendStatus(400);
  }
}
