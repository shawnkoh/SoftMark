import { Request, Response } from "express";
import { validateOrReject, validate } from "class-validator";
import { pick } from "lodash";
import { getRepository, IsNull, Not, getManager } from "typeorm";

import { Page } from "../entities/Page";
import { PaperUser } from "../entities/PaperUser";
import { Script } from "../entities/Script";
import { User } from "../entities/User";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { ScriptListData } from "../types/scripts";
import { allowedRequester } from "../utils/papers";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.id;
  const paperId = Number(request.params.id);
  const { email, imageUrls } = pick(request.body, "email", "imageUrls");
  const allowed = await allowedRequester(
    requesterId,
    paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  let student = await getRepository(User).findOne({ where: { email } });
  let paperUser: PaperUser | undefined;
  if (student) {
    paperUser = await getRepository(PaperUser).findOne({
      where: { paperId, user: student }
    });
  } else {
    student = new User();
    student.email = email;
    await validate(student);
    const errors = await validate(student);
    if (errors.length > 0) {
      response.sendStatus(400);
      return;
    }
  }

  if (!paperUser) {
    paperUser = new PaperUser();
    paperUser.paperId = paperId;
    paperUser.user = student;
    paperUser.role = PaperUserRole.Student;
    const errors = await validate(paperUser);
    if (errors.length > 0) {
      response.sendStatus(400);
      return;
    }
  }

  const script = new Script(paperId, paperUser);
  const errors = await validate(script);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }

  let pages: Page[];
  try {
    pages = await Promise.all(
      imageUrls.map(
        async (imageUrl: string, index: number): Promise<Page> => {
          const page = new Page(script, imageUrl, index + 1);
          await validateOrReject(page);
          return page;
        }
      )
    );
  } catch (error) {
    response.sendStatus(400);
    return;
  }

  await getManager().transaction(async manager => {
    await manager.save(student);
    await manager.save(paperUser);
    await manager.save(script);
    await Promise.all(pages.map(async page => await manager.save(page)));
  });

  const data = await script.getData();
  response.status(201).json({ script: data });
}

export async function index(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.id;
  const paperId = Number(request.params.id);
  const allowed = await allowedRequester(
    userId,
    paperId,
    PaperUserRole.Student
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { paper, requester } = allowed;

  const scripts = await getRepository(Script).find(
    requester.role === PaperUserRole.Student
      ? { paper, paperUser: requester }
      : { paper }
  );

  const data: ScriptListData[] = await Promise.all(
    scripts.map(script => script.getListData())
  );
  response.status(200).json({ scripts: data });
}

export async function show(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.id;
  const scriptId = request.params.id;
  const script = await getRepository(Script).findOne(scriptId, {
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
  if (!script) {
    response.sendStatus(404);
    return;
  }
  const allowed = await allowedRequester(
    userId,
    script.paperId,
    PaperUserRole.Student
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { requester } = allowed;
  if (
    requester.role === PaperUserRole.Student &&
    script.paperUserId !== requester.id
  ) {
    response.sendStatus(404);
    return;
  }

  const data = await script.getData();
  response.status(200).json({ script: data });
}

export async function discard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.id;
  const scriptId = request.params.id;
  const script = await getRepository(Script).findOne(scriptId, {
    where: { discardedAt: IsNull() }
  });
  if (!script) {
    response.sendStatus(404);
    return;
  }
  const allowed = await allowedRequester(
    userId,
    script.paperId,
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
}

export async function undiscard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.id;
  const scriptId = request.params.id;
  const script = await getRepository(Script).findOne(scriptId, {
    where: { discardedAt: Not(IsNull()) }
  });
  if (!script) {
    response.sendStatus(404);
    return;
  }
  const allowed = await allowedRequester(
    userId,
    script.paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  script.discardedAt = null;
  const errors = await validate(script);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(Script).save(script);

  const data = await script.getData();
  response.status(200).json({ script: data });
}
