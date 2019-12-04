import { validate, validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getConnection, getManager, getRepository, IsNull, Not } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { Page } from "../entities/Page";
import { PaperUser } from "../entities/PaperUser";
import { Question } from "../entities/Question";
import QuestionTemplate from "../entities/QuestionTemplate";
import { Script } from "../entities/Script";
import { PaperUserRole, ScriptMappingData } from "../types/paperUsers";
import { ScriptData, ScriptPatchData } from "../types/scripts";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester } from "../utils/papers";
import publishScripts from "../utils/publication";
import { sendScriptEmail } from "../utils/sendgrid";

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

  const script = new Script(paperId, filename, sha256);
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

  const { paper } = allowed;

  const { filename, hasVerifiedStudent, studentId }: ScriptPatchData = pick(
    request.body,
    "filename",
    "hasVerifiedStudent",
    "studentId"
  );

  const patchData: QueryDeepPartialEntity<Script> = {
    filename: filename ? filename.toUpperCase() : script.filename,
    hasVerifiedStudent:
      hasVerifiedStudent !== undefined
        ? hasVerifiedStudent
        : script.hasVerifiedStudent
  };

  if (studentId && studentId !== script.studentId) {
    patchData.studentId = studentId;
    patchData.publishedDate = null;
  } else if (studentId === null) {
    patchData.studentId = null;
    patchData.publishedDate = null;
  }

  const errors = await validate(script);
  if (errors.length > 0) {
    return response.sendStatus(400);
  }

  try {
    await getRepository(Script).update(script.id, patchData);
  } catch (error) {
    return response.sendStatus(400);
  }

  const data = await script.getListData();
  // Optimisation: Makes use of script.getListData instead of publication util to save a query
  if (
    paper.publishedDate &&
    !data.publishedDate &&
    data.completedMarking &&
    data.studentId &&
    data.studentEmail
  ) {
    sendScriptEmail(
      paper.name,
      data.studentId,
      data.studentEmail,
      data.studentName
    );
    const publishedDate = new Date();
    await getRepository(Script).update(script.id, {
      publishedDate
    });
    data.publishedDate = publishedDate;
  }
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

  const { paper } = allowed;

  const scripts = await getRepository(Script).find({
    paperId,
    discardedAt: IsNull()
  });
  const allStudents = await getRepository(PaperUser).find({
    paperId,
    role: PaperUserRole.Student,
    discardedAt: IsNull()
  });

  /** Matching algorithm start */
  const studentsMap: Map<string, PaperUser> = new Map(); // matric to student
  for (let i = 0; i < allStudents.length; i++) {
    const student = allStudents[i];
    const matriculationNumber = student.matriculationNumber;
    if (matriculationNumber) {
      studentsMap.set(matriculationNumber.toLocaleUpperCase(), student);
    }
  }

  const scriptsMap: Map<string, Script> = new Map(); // filename to script
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    scriptsMap.set(script.filename.toLocaleUpperCase(), script);
  }

  const { csvFile } = request.body as ScriptMappingData;
  let successfullyMatched = "";
  let failedToBeMatched = "";
  const rows: string[] = csvFile.split("\n");
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.split("\r")[0].split(",");
    if (cells.length >= 2) {
      const filename = cells[0].toLocaleUpperCase();
      const matriculationNumber = cells[1].toLocaleUpperCase();
      const mappingDetails = matriculationNumber + " " + filename;

      const student = studentsMap.get(matriculationNumber);
      const script = scriptsMap.get(filename);

      if (!script) {
        failedToBeMatched += mappingDetails + " (filename not found)\n";
        continue;
      } else if (!student) {
        failedToBeMatched +=
          mappingDetails + " (matriculation number not found)\n";
        continue;
      } else if (script.studentId === student.id) {
        failedToBeMatched +=
          mappingDetails + " (already matched to each other)\n";
        continue;
      }

      script.student = student;
      script.publishedDate = null;
      const errors = await validate(script);
      // this is not good practice for error handling, but it will do for now
      if (errors.length === 0) {
        await getRepository(Script).save(script);
        successfullyMatched += mappingDetails + "\n";

        // ensures 1 to 1 mapping within the list but not within the system
        studentsMap.delete(matriculationNumber);
        scriptsMap.delete(filename);
      } else {
        failedToBeMatched += mappingDetails + " (Error: " + errors[0] + ")\n";
      }
    }
  }

  /** Matching algorithm end */
  await publishScripts(paper.id, paper.name, paper.publishedDate);

  return response.status(200).json({ successfullyMatched, failedToBeMatched });
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
      script."hasVerifiedStudent",
      script."publishedDate",
      script.filename,
      script."createdAt",
      script."updatedAt",
      script."discardedAt",
      student.*,
      page."pageCount",
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
        COUNT(page.id)::INTEGER "pageCount"
      FROM script
      LEFT JOIN page on script.id = page."scriptId" AND page."discardedAt" IS NULL
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
    
    WHERE
      script."discardedAt" IS NULL
      AND script."paperId" = ${paperId}
      ${
        requester.role === PaperUserRole.Student
          ? 'AND script."studentId" = ' + requester.id
          : ""
      }
    
    ORDER BY script.id
  `);

  response.status(200).json({ scripts });
}

export async function show(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.userId;
  const scriptId = request.params.id;
  const script = await getRepository(Script).findOne(scriptId, {
    where: { discardedAt: IsNull() },
    relations: ["pages", "pages.annotations"]
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

  const data: ScriptData = {
    filename: script.filename,
    pages: (script.pages as Page[]).map((page: Page) => ({
      ...page.getListData(),
      annotations: page.annotations!
    }))
  };
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

  const data = await script.getListData();
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
