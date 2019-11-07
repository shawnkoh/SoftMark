import { Request, Response } from "express";
import { validateOrReject, validate } from "class-validator";
import { pick } from "lodash";
import { getRepository, IsNull, Not, getManager } from "typeorm";

import { Page } from "../entities/Page";
import { PaperUser } from "../entities/PaperUser";
import { Script } from "../entities/Script";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { ScriptListData } from "../types/scripts";
import { allowedRequester } from "../utils/papers";
import { ScriptTemplate } from "../entities/ScriptTemplate";
import { Question } from "../entities/Question";
import { sortByFilename } from "../utils/sorts";
import { string } from "prop-types";

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

  // Case: if identical script is stored in db
  const existingScript = await getRepository(Script).findOne({
    paperId,
    sha256
  });
  if (existingScript) {
    existingScript.filename = filename;
    existingScript.discardedAt = null;
    const errors = await validate(existingScript);
    if (errors.length > 0) {
      return response.sendStatus(400);
    }
    await getRepository(Script).save(existingScript);
    const data = await existingScript.getData();
    return response.status(201).json({ script: data });
  }

  // Case: new script
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
    script.filename = filename.toUpperCase();
  }
  if (hasVerifiedStudent !== undefined) {
    script.hasVerifiedStudent = hasVerifiedStudent;
  }
  if (studentId !== undefined) {
    script.student = studentId ? await getRepository(PaperUser).findOne(studentId) : null;
  }

  const errors = await validate(script);
  if (errors.length > 0) {
    return response.sendStatus(400);
  }

  try {
    await getRepository(Script).save(script);
  } catch (error) {
    return response.sendStatus(400);
  }

  const data = await script.getData();
  response.status(201).json({ script: data });
}

export async function match(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.id;
  const paperId = Number(request.params.id);
  const allowed = await allowedRequester(
    userId,
    paperId,
    PaperUserRole.Student
  );
  if (!allowed) {
    return response.sendStatus(404);
  }
  const { paper, requester } = allowed;

  const scripts = await getRepository(Script).find({ paperId, discardedAt: IsNull() });
  const paperUsers = await getRepository(PaperUser).find({ paperId, role: PaperUserRole.Student, discardedAt: IsNull() })

  /** Matching algorithm start */
  const paperUsersMap: Map<string, PaperUser> = new Map();
  const boundedPaperUsersMap: Map<number | null, boolean> = new Map();
  for(let i = 0; i < paperUsers.length; i++) {
    const paperUser = paperUsers[i];
    const matriculationNumber = paperUser.matriculationNumber;
    if(matriculationNumber){
      paperUsersMap.set(matriculationNumber, paperUser);
    }
  }

  // Unbind unverified associations
  for(let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.hasVerifiedStudent && script.studentId) {
      boundedPaperUsersMap.set(script.studentId, true);
    }
  }

  // Bind unmatched students with scripts with same filename
  for(let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    const student = paperUsersMap.get(script.filename);
    const isBoundedStudent = student ? boundedPaperUsersMap.get(student.id) : false;
    if(!script.hasVerifiedStudent && student && !isBoundedStudent){
        script.student = await getRepository(PaperUser).findOne(student.id);
    } else if (!script.hasVerifiedStudent) {
        script.student = null;
    } else if (script.studentId) {
        script.student = await getRepository(PaperUser).findOne(script.studentId);
    }
  }

  /** Matching algorithm end */

  await getManager().transaction(async manager => {
    await Promise.all(scripts.map(async script => {
      await manager.save(script);
    }));
  });

  const data: ScriptListData[] = await Promise.all(
    scripts.sort(sortByFilename).map(script => script.getListData())
  );
  response.status(200).json({ scripts: data });
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
    scripts.sort(sortByFilename).map(script => script.getListData())
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
    discardedAt: new Date(),
    hasVerifiedStudent: false
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
