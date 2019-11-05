import { validateOrReject, validate } from "class-validator";
import { Request, Response } from "express";
import { getRepository, IsNull, getManager } from "typeorm";
import { pick } from "lodash";

import { PageTemplate } from "../entities/PageTemplate";
import { ScriptTemplate } from "../entities/ScriptTemplate";
import { PaperUserRole } from "../types/paperUsers";
import { ScriptTemplatePostData } from "../types/scriptTemplates";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester, allowedRequesterOrFail } from "../utils/papers";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.id;
  const paperId = Number(request.params.id);
  const { imageUrls, sha256 } = pick(
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
    response.sendStatus(404);
    return;
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
    response.sendStatus(204);
    return;
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
    payload.id,
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
    response.status(200).json({ scriptTemplate: data });
  } catch (error) {
    response.sendStatus(400);
  }
}
