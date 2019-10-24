import { Request, Response } from "express";
import { validateOrReject } from "class-validator";
import { getRepository, IsNull, Not } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { PaperUserRole } from "../types/paperUsers";
import { Script } from "../entities/Script";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedPaperUser, allowedOrFail } from "../utils/papers";

export async function create(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const paperId = Number(request.params.id);
    const paper = await getRepository(Paper).findOneOrFail(paperId, {
      where: { discardedAt: Not(IsNull()) }
    });
    const paperUser = await getRepository(PaperUser).findOneOrFail({
      paperId: paperId,
      userId: userId,
      discardedAt: IsNull()
    });
    const allowed = await allowedPaperUser(
      userId,
      paperUser.id,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    const script = new Script();
    script.paper = paper;
    script.paperUser = paperUser;
    await validateOrReject(script);

    await getRepository(Script).save(script);

    const data = await script.getData();
    response.status(200).json(data);
  } catch {
    response.sendStatus(400);
  }
}

export async function index(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const paperId = Number(request.params.id);
    const paper = await getRepository(Paper).findOneOrFail(paperId, {
      where: { discardedAt: Not(IsNull()) }
    });
    const paperUser = await getRepository(PaperUser).findOneOrFail({
      paperId: paperId,
      userId: userId,
      discardedAt: IsNull()
    });
    const allowed = await allowedPaperUser(userId, paperUser.id);
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    const scripts = await getRepository(Script).find({
      paperId: paperId
    });

    const data = await Promise.all(scripts.map(script => script.getData()));
    response.status(200).json(data);
  } catch {
    response.sendStatus(400);
  }
}

export async function show(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.id;
  const scriptId = request.params.id;
  let script: Script;
  try {
    script = await getRepository(Script).findOneOrFail(scriptId, {
      where: { discardedAt: IsNull() },
      relations: [
        "paperUser",
        "pages",
        "pages.annotations",
        "questions",
        "questions.bookmarks",
        "questions.comments",
        "questions.marks",
        "questions.questionTemplate"
      ]
    });
    const { paperUser } = await allowedOrFail(userId, script.paperId);
    if (
      paperUser.role === PaperUserRole.Student &&
      script.paperUserId !== paperUser.id
    ) {
      throw new Error(
        "Student cannot access a script that doesnt belong to him"
      );
    }
  } catch (error) {
    console.error(error);
    response.sendStatus(404);
    return;
  }

  try {
    const data = await script.getData();
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const scriptId = request.params.id;
    const script = await getRepository(Script).findOneOrFail(scriptId, {
      where: { discardedAt: IsNull() }
    });
    const allowed = await allowedPaperUser(
      userId,
      script.paperUserId,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(Script).update(scriptId, {
      discardedAt: new Date()
    });

    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function undiscard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const scriptId = request.params.id;
    let script = await getRepository(Script).findOneOrFail(scriptId, {
      where: { discardedAt: Not(IsNull()) }
    });
    const allowed = await allowedPaperUser(
      userId,
      script.paperUserId,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(Script).update(scriptId, {
      discardedAt: undefined
    });

    script = await getRepository(Script).findOneOrFail(scriptId, {
      where: { discardedAt: IsNull() }
    });
    const data = await script.getData();
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}
