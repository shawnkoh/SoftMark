import { Request, Response } from "express";
import { validateOrReject } from "class-validator";
import { getRepository, IsNull, Not, getManager } from "typeorm";

import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { Script } from "../entities/Script";
import { User } from "../entities/User";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { ScriptListData } from "../types/scripts";
import { allowedRequesterOrFail } from "../utils/papers";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.id;
  const paperId = Number(request.params.id);
  const { email, imageUrls } = request.body;
  try {
    await allowedRequesterOrFail(requesterId, paperId, PaperUserRole.Owner);
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    let student = await getRepository(User).findOne({ where: { email } });
    let paperUser: PaperUser | undefined;
    if (student) {
      paperUser = await getRepository(PaperUser).findOne({
        where: { paperId, user: student }
      });
    } else {
      student = new User();
      student.email = email;
      await validateOrReject(student);
    }

    if (!paperUser) {
      paperUser = new PaperUser();
      paperUser.paperId = paperId;
      paperUser.user = student;
      paperUser.role = PaperUserRole.Student;
      await validateOrReject(paperUser);
    }

    const script = new Script();
    script.paperId = paperId;
    script.paperUser = paperUser;
    script.imageUrls = imageUrls;
    await validateOrReject(script);

    await getManager().transaction(async manager => {
      await manager.save(student);
      await manager.save(paperUser);
      await manager.save(script);
    });

    const data = await script.getData();
    response.status(201).json({ script: data });
  } catch {
    response.sendStatus(400);
  }
}

export async function index(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.id;
  const paperId = Number(request.params.id);
  let paper: Paper;
  let paperUser: PaperUser;
  try {
    ({ paper, paperUser } = await allowedRequesterOrFail(
      userId,
      paperId,
      PaperUserRole.Student
    ));
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    const scripts = await getRepository(Script).find(
      paperUser.role === PaperUserRole.Student
        ? { paper, paperUser }
        : { paper }
    );

    const data: ScriptListData[] = await Promise.all(
      scripts.map(script => script.getListData())
    );
    response.status(200).json({ scripts: data });
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
    const { paperUser } = await allowedRequesterOrFail(userId, script.paperId);
    if (
      paperUser.role === PaperUserRole.Student &&
      script.paperUserId !== paperUser.id
    ) {
      throw new Error(
        "Student cannot access a script that doesnt belong to him"
      );
    }
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    const data = await script.getData();
    response.status(200).json({ script: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.id;
  const scriptId = request.params.id;
  try {
    const script = await getRepository(Script).findOneOrFail(scriptId, {
      where: { discardedAt: IsNull() }
    });
    await allowedRequesterOrFail(userId, script.paperId, PaperUserRole.Owner);
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    await getRepository(Script).update(scriptId, {
      discardedAt: new Date()
    });

    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function undiscard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.id;
  const scriptId = request.params.id;
  let script: Script;
  try {
    script = await getRepository(Script).findOneOrFail(scriptId, {
      where: { discardedAt: Not(IsNull()) }
    });
    await allowedRequesterOrFail(userId, script.paperId, PaperUserRole.Owner);
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    script.discardedAt = null;
    await getRepository(Script).save(script);

    const data = await script.getData();
    response.status(200).json({ script: data });
  } catch (error) {
    response.sendStatus(400);
  }
}
