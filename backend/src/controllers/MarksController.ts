import { validate } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getRepository, IsNull } from "typeorm";
import { Mark } from "../entities/Mark";
import { Question } from "../entities/Question";
import { isAllocated } from "../middlewares/canModifyMark";
import { MarkPatchData, MarkPostData } from "../types/marks";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester } from "../utils/papers";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const questionId = request.params.id;
  const postData: MarkPostData = pick(request.body, "score");
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

  const mark = new Mark(question, requester, postData.score);
  const errors = await validate(mark);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(Mark).save(mark);

  const data = await mark.getData();
  response.status(201).json({ mark: data });
}

export async function update(request: Request, response: Response) {
  const mark = response.locals.mark;
  const patchData: MarkPatchData = pick(request.body, "score");

  mark.score = patchData.score;
  const errors = await validate(mark);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(Mark).save(mark);

  const data = await mark.getData();
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

  const data = await mark.getData();
  response.status(200).json({ mark: data });
}
