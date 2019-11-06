import { Request, Response } from "express";
import { validateOrReject, validate } from "class-validator";
import { pick } from "lodash";
import { getRepository, IsNull, Not, getManager } from "typeorm";

import { Page } from "../entities/Page";
import { Script } from "../entities/Script";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { ScriptListData } from "../types/scripts";
import { allowedRequester } from "../utils/papers";
import { ScriptTemplate } from "../entities/ScriptTemplate";
import { Question } from "../entities/Question";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.id;
  const paperId = Number(request.params.id);
  const { filename, sha256, imageUrls } = pick(
    request.body,
    "filename",
    "sha256",
    "imageUrls"
  );
  const allowed = await allowedRequester(
    requesterId,
    paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  // TODO: if there is a script with the same sha256 WITH a student, reject
  // TODO: if there is a script with the same sha256 WITHOUT a student, update filename AND apply matching algo

  const script = new Script(paperId, filename, sha256);
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

  // Attempt to match with users

  // Create questions based on the current script template, if any.
  const scriptTemplate = await getRepository(ScriptTemplate).findOne({
    relations: ["questionTemplates"],
    where: { paperId, discardedAt: IsNull() }
  });

  let questions: Question[] | undefined;
  if (scriptTemplate && scriptTemplate.questionTemplates) {
    questions = scriptTemplate.questionTemplates.map(questionTemplate => {
      const question = new Question(script, questionTemplate);
      return question;
    });
  }

  await getManager().transaction(async manager => {
    await manager.save(script);
    await Promise.all(pages.map(async page => await manager.save(page)));
    if (questions) {
      await Promise.all(
        questions.map(async question => await manager.save(question))
      );
    }
  });

  const data = await script.getData();
  response.status(201).json({ script: data });
}

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.id;
  const scriptId = Number(request.params.id);
  const script = await getRepository(Script).findOneOrFail(scriptId);

  const allowed = await allowedRequester(
    requesterId,
    script.paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  const { filename, hasVerifiedStudent, studentId } = pick(
    request.body,
    "filename",
    "hasVerifiedStudent",
    "studentId"
  );

  if (filename) {
    script.filename = filename;
  }
  if (hasVerifiedStudent !== undefined) {
    script.hasVerifiedStudent = hasVerifiedStudent;
  }
  if (studentId !== undefined) {
    script.studentId = studentId;
  }

  const errors = await validate(script);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }

  try {
    await getRepository(Script).save(script);
  } catch (error) {
    response.sendStatus(400);
    return;
  }

  // Attempt to match with users

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
      ? { paper, student: requester, discardedAt: IsNull() }
      : { paper, discardedAt: IsNull() }
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
      "student",
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
    script.studentId !== requester.id
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
