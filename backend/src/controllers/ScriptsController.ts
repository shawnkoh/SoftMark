import { validate, validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getConnection, getManager, getRepository, IsNull, Not } from "typeorm";
import { Page } from "../entities/Page";
import { PaperUser } from "../entities/PaperUser";
import { Question } from "../entities/Question";
import QuestionTemplate from "../entities/QuestionTemplate";
import { Script } from "../entities/Script";
import { ScriptTemplate } from "../entities/ScriptTemplate";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester } from "../utils/papers";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
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

  // TODO: Can compress this into one query using a subquery in the andWhere but for now this will do
  // Even better if these were in a ValidatorConstraint because they check and return all the errors
  const existingFilename = await getRepository(Script).findOne({
    paperId,
    filename,
    discardedAt: IsNull()
  });

  const existingSha256 = await getRepository(Script).findOne({
    paperId,
    sha256,
    discardedAt: IsNull()
  });

  if (existingFilename) {
    response.status(400).send("Duplicate filename");
    return;
  }

  if (existingSha256) {
    response.status(400).send("Duplicate sha256");
    return;
  }

  const script = new Script(
    paperId,
    filename,
    sha256,
    (imageUrls as string[]).length
  );
  const errors = await validate(script);

  if (errors.length > 0) {
    response.status(400).json(errors);
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
    response.status(400).json(error);
    return;
  }

  const questionTemplates = await getRepository(QuestionTemplate)
    .createQueryBuilder("questionTemplate")
    .where("questionTemplate.discardedAt IS NULL")
    // select only leaves
    .andWhere("questionTemplate.displayPage IS NOT NULL")
    .innerJoin(
      "questionTemplate.scriptTemplate",
      "scriptTemplate",
      "scriptTemplate.discardedAt IS NULL AND scriptTemplate.paperId = :paperId",
      { paperId }
    )
    .getMany();

  const questions = questionTemplates.map(
    questionTemplate => new Question(script, questionTemplate)
  );

  await getManager().transaction(async manager => {
    await manager.save(script);
    await Promise.all(pages.map(async page => await manager.save(page)));
    if (questions) {
      await Promise.all(
        questions.map(async question => await manager.save(question))
      );
    }
  });

  const data = await script.getListData();
  response.status(201).json({ script: data });
}

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
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
    script.student = studentId
      ? await getRepository(PaperUser).findOne(studentId)
      : null;
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

  const data = await script.getListData();
  response.status(201).json({ script: data });
}

export async function match(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.userId;
  const paperId = Number(request.params.id);
  const allowed = await allowedRequester(
    userId,
    paperId,
    PaperUserRole.Student
  );
  if (!allowed) {
    return response.sendStatus(404);
  }

  const scripts = await getRepository(Script).find({
    paperId,
    discardedAt: IsNull()
  });
  const paperUsers = await getRepository(PaperUser).find({
    paperId,
    role: PaperUserRole.Student,
    discardedAt: IsNull()
  });

  /** Matching algorithm start */
  const paperUsersMap: Map<string, PaperUser> = new Map();
  const boundedPaperUsersMap: Map<number | null, boolean> = new Map();
  for (let i = 0; i < paperUsers.length; i++) {
    const paperUser = paperUsers[i];
    const matriculationNumber = paperUser.matriculationNumber;
    if (matriculationNumber) {
      paperUsersMap.set(matriculationNumber, paperUser);
    }
  }

  // Unbind unverified associations
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.hasVerifiedStudent && script.studentId) {
      boundedPaperUsersMap.set(script.studentId, true);
    }
  }

  // Bind unmatched students with scripts with same filename
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    const student = paperUsersMap.get(script.filename);
    const isBoundedStudent = student
      ? boundedPaperUsersMap.get(student.id)
      : false;
    if (!script.hasVerifiedStudent && student && !isBoundedStudent) {
      script.student = await getRepository(PaperUser).findOne(student.id);
    } else if (!script.hasVerifiedStudent) {
      script.student = null;
    } else if (script.studentId) {
      script.student = await getRepository(PaperUser).findOne(script.studentId);
    }
  }

  /** Matching algorithm end */

  await getManager().transaction(async manager => {
    await Promise.all(
      scripts.map(async script => {
        await manager.save(script);
      })
    );
  });

  return response.sendStatus(200);
}

export async function index(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.userId;
  const paperId = Number(request.params.id);
  // Defend against SQL Injection
  if (isNaN(paperId)) {
    response.sendStatus(400);
    return;
  }

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

  const scripts = await getConnection().query(`
    SELECT
      script.id,
      script.filename,
      script."createdAt",
      script."updatedAt",
      script."discardedAt",
      student.*,
      page."pageCount"::INTEGER,
      question."totalScore",
      question."completedMarking"

    FROM script
    
    LEFT JOIN (
      SELECT
        "student".id "studentId",
        "student"."matriculationNumber",
        "user".name "studentName",
        "user".email "studentEmail"
      FROM "paper_user" "student"
      INNER JOIN "user" ON student."userId" = "user".id AND "user"."discardedAt" IS NULL
      WHERE "student"."paperId" = ${paperId}
    ) student ON script."studentId" = student."studentId"
    
    INNER JOIN (
      SELECT
        script.id "scriptId",
        COUNT(page.id) "pageCount"
      FROM script
      INNER JOIN page on script.id = page."scriptId" AND page."discardedAt" IS NULL
      WHERE script."paperId" = ${paperId} AND script."discardedAt" IS NULL
      GROUP BY script.id
    ) page ON page."scriptId" = script.id
    
    INNER JOIN (
      SELECT
        script.id "scriptId",
        COALESCE(SUM(question.score), 0) "totalScore",
        CASE WHEN COUNT(question.score) = COUNT(question."questionId") THEN true ELSE false END "completedMarking"
      FROM script
      LEFT JOIN (
        SELECT question."scriptId", question.id "questionId", mark.score
        FROM question
        LEFT JOIN mark ON mark."questionId" = question.id AND mark."discardedAt" IS NULL
        WHERE question."discardedAt" IS NULL
      ) question ON script.id = question."scriptId"
      WHERE script."paperId" = ${paperId} AND script."discardedAt" IS NULL
      GROUP BY script.id
    ) question ON script.id = question."scriptId"
    
    WHERE script."discardedAt" IS NULL AND script."paperId" = ${paperId}
    
    ORDER BY script.id
  `);

  console.log(scripts);
  response.status(200).json({ scripts });
}

export async function show(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.userId;
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
  const userId = payload.userId;
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
    studentId: null,
    discardedAt: new Date(),
    hasVerifiedStudent: false
  });

  response.sendStatus(204);
}

export async function undiscard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.userId;
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

export async function discardScripts(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.userId;
    const paperId = Number(request.params.id);
    const allowed = await allowedRequester(
      userId,
      paperId,
      PaperUserRole.Owner
    );
    if (!allowed) {
      return response.sendStatus(404);
    }

    const scripts = await getRepository(Script).find({
      where: { paperId, discardedAt: IsNull() }
    });

    await getManager().transaction(async manager => {
      await Promise.all(
        scripts.map(async script => {
          await getRepository(Script).update(script.id, {
            discardedAt: new Date()
          });
        })
      );
    });

    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}

const getActiveScriptTemplateData = async (paperId: number) => {
  const scriptTemplate = await getRepository(ScriptTemplate).findOne({
    where: { paperId: paperId, discardedAt: IsNull() },
    relations: ["questionTemplates"]
  });
  return scriptTemplate ? await scriptTemplate.getData() : scriptTemplate;
};
