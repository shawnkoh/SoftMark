import { Request, Response } from "express";
import { getRepository, getManager, IsNull } from "typeorm";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { ScriptTemplate } from "../entities/ScriptTemplate";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { getEntityArray } from "../utils/entities";
import { allowedPaperUser } from "../utils/papers";

export async function create(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const allowed = await allowedPaperUser(
      payload.id,
      request.params.id,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }
    const { paper, paperUser } = allowed;

    const scriptTemplate = new ScriptTemplate();
    scriptTemplate.paperId = paper.id;
    const questionTemplates = await getEntityArray(
      request.body.questionTemplates,
      QuestionTemplate,
      { scriptTemplate }
    );

    await getManager().transaction(async manager => {
      await manager.update(
        ScriptTemplate,
        { discardedAt: IsNull() },
        { discardedAt: new Date() }
      );
      await manager.update(
        QuestionTemplate,
        { discardedAt: IsNull() },
        { discardedAt: new Date() }
      );
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
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const allowed = await allowedPaperUser(payload.id, request.params.id);
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
    return;
  }
}
