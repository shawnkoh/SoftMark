import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository, IsNull, getManager } from "typeorm";
import { pick } from "lodash";

import { ScriptTemplate } from "../entities/ScriptTemplate";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import {
  ScriptTemplatePatchData,
  ScriptTemplatePostData
} from "../types/scriptTemplates";
import { allowedPaperUser, allowedOrFail } from "../utils/papers";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const paperId = Number(request.params.id);
  const postData = pick(request.body, "name") as ScriptTemplatePostData;
  try {
    await allowedOrFail(payload.id, paperId, PaperUserRole.Owner);
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    const count = await getRepository(ScriptTemplate).count({
      paperId,
      discardedAt: IsNull()
    });
    if (count > 0) {
      throw new Error("Not allowed to have more than one script template");
    }
    const scriptTemplate = new ScriptTemplate();
    scriptTemplate.paperId = paperId;
    if (postData.name !== undefined) {
      scriptTemplate.name = postData.name;
    }
    await validateOrReject(scriptTemplate);

    // TODO: upload image and generate question templates

    await getManager().transaction(async manager => {
      // save question templates
      await manager.save(scriptTemplate);
    });

    const data = await scriptTemplate.getData();
    response.status(201).json({ scriptTemplate: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function showActive(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const paperId = request.params.id;
  const allowed = await allowedPaperUser(payload.id, paperId);
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

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const scriptTemplateId = Number(request.params.id);
  const patchData = pick(request.body, "name") as ScriptTemplatePatchData;
  let scriptTemplate: ScriptTemplate;
  try {
    scriptTemplate = await getRepository(ScriptTemplate).findOneOrFail(
      scriptTemplateId,
      { relations: ["pageTemplates", "questionTemplates"] }
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
    if (patchData.name !== undefined) {
      scriptTemplate.name = patchData.name;
    }
    await validateOrReject(scriptTemplate);
    await getRepository(ScriptTemplate).save(scriptTemplate);

    const data = await scriptTemplate.getData();
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
    response.status(200).json({ scriptTemplate: data });
  } catch (error) {
    response.sendStatus(400);
  }
}
