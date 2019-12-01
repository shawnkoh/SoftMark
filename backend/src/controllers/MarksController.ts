import { validate } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getRepository, IsNull } from "typeorm";
import { Mark } from "../entities/Mark";
import { Question } from "../entities/Question";
import { isAllocated } from "../middlewares/canModifyMark";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester } from "../utils/papers";

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
  const { requester } = allowed;
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
