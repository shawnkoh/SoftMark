import { validate } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import {
  createQueryBuilder,
  getConnection,
  getRepository,
  IsNull
} from "typeorm";
import { Mark } from "../entities/Mark";
import { Question } from "../entities/Question";
import QuestionTemplate from "../entities/QuestionTemplate";
import { isAllocated } from "../middlewares/canModifyMark";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester, allowedRequesterBoolean } from "../utils/papers";
import publishScripts from "../utils/publication";

export async function replace(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const questionId = request.params.id;
  const { score } = pick(request.body, "score");
  const question = await getRepository(Question).findOne(questionId, {
    where: { discardedAt: IsNull() },
    relations: ["script", "questionTemplate", "questionTemplate.allocations"]
  });
  if (!question) {
    response.sendStatus(404);
    return;
  }
  const paperId = question.script!.paperId;
  const questionTemplate = question.questionTemplate!;
  const allowed = await allowedRequester(
    requesterId,
    paperId,
    PaperUserRole.Marker
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { requester, paper } = allowed;
  if (
    requester.role === PaperUserRole.Marker &&
    !(await isAllocated(questionTemplate, requester.id))
  ) {
    response.sendStatus(404);
    return;
  }

  let mark = new Mark(question, requester, score);
  const errors = await validate(mark);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  try {
    await getRepository(Mark).save(mark);
  } catch (error) {
    if (
      error.message ===
      'duplicate key value violates unique constraint "mark_unique_constraint"'
    ) {
      mark = await getRepository(Mark).findOneOrFail({
        question,
        marker: requester,
        discardedAt: IsNull()
      });
      mark.score = score;
      await getRepository(Mark).update(mark.id, { score: mark.score });
    } else {
      throw error;
    }
  }

  await publishScripts(paper.id, paper.name, paper.publishedDate);

  const data = mark.getData();
  response.status(200).json({ mark: data });
}

export async function discard(request: Request, response: Response) {
  const mark: Mark = response.locals.mark;

  mark.discardedAt = new Date();
  const errors = await validate(mark);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(Mark).save(mark);

  response.sendStatus(204);
}

export async function undiscard(request: Request, response: Response) {
  const mark: Mark = response.locals.mark;

  mark.discardedAt = null;
  const errors = await validate(mark);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(Mark).save(mark);

  const data = mark.getData();
  response.status(200).json({ mark: data });
}

export async function exportMarks(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;
  const { paperId } = request.params;

  if (!(await allowedRequesterBoolean(userId, paperId, PaperUserRole.Marker))) {
    response.sendStatus(404);
    return;
  }

  // Get a list of question names so that we can build the query
  const namesData = await createQueryBuilder()
    .select("DISTINCT questionTemplate.name", "name")
    .from(QuestionTemplate, "questionTemplate")
    .innerJoin(
      "questionTemplate.scriptTemplate",
      "scriptTemplate",
      "scriptTemplate.paperId = :paperId AND scriptTemplate.discardedAt IS NULL",
      { paperId }
    )
    .where("questionTemplate.discardedAt IS NULL")
    .andWhere("questionTemplate.score IS NOT NULL")
    .orderBy("questionTemplate.name", "ASC")
    .getRawMany();

  const names = namesData.map(data => data.name);

  // prettier-ignore
  const marks = await getConnection().query(`
    SELECT
      script.id "scriptId",
      script."filename",
      student."matriculationNumber",
      student."name",
      student."email",
      (${names.map(name => `mark."${name}"`).join(" + ")}) total,
      ${names.map(name => `mark."${name}"`).join(", ")}
      
    FROM script
    
    LEFT JOIN (
      SELECT
        student.id,
        student."matriculationNumber",
        "user"."email",
        "user"."name"
      FROM paper_user student
      INNER JOIN "user" ON student."userId" = "user".id
    ) student
    ON script."studentId" = student.id

    INNER JOIN (
      SELECT *
      FROM crosstab(
        'SELECT
          question."scriptId",
          question_template."name",
          mark.score
        FROM question
        INNER JOIN question_template
        ON question."questionTemplateId" = question_template.id AND question_template."discardedAt" IS NULL
        LEFT JOIN mark
        ON question.id = mark."questionId" AND mark."discardedAt" IS NULL
        ORDER BY
          question."scriptId",
          question_template."displayPage",
          question_template."topOffset",
          question_template."leftOffset";'
      ) AS ct("scriptId" integer, ${names.map(name => `"${name}" float`).join(", ")})
    ) mark
    ON script.id = mark."scriptId"
    
    WHERE script."paperId" = ${paperId}
    AND script."discardedAt" IS NULL
  `);

  response.status(200).json({ marks });
}
