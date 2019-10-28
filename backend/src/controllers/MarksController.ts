import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository, IsNull, Not } from "typeorm";
import { Allocation } from "../entities/Allocation";
import { Mark } from "../entities/Mark";
import { PaperUser } from "../entities/PaperUser";
import { Question } from "../entities/Question";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedMarker } from "../utils/marks";
import { MarkPostData, MarkPatchData } from "../types/marks";
import { PaperUserRole } from "../types/paperUsers";
import { allowedRequester } from "../utils/papers";

export async function create(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const questionId = Number(request.params.id);
    const postData: MarkPostData = request.body;
    const { paperUserId } = postData;
    const paperUser = await getRepository(PaperUser).findOneOrFail(
      paperUserId,
      { where: { discardedAt: IsNull() } }
    );
    const question = await getRepository(Question).findOneOrFail(questionId, {
      where: { discardedAt: IsNull() }
    });
    const questionTemplateId = question.questionTemplateId;
    const questionTemplate = await getRepository(
      QuestionTemplate
    ).findOneOrFail(questionTemplateId, { where: { discardedAt: IsNull() } });
    const allocation = await getRepository(Allocation).findOneOrFail({
      questionTemplateId,
      paperUserId
    });
    if (!allocation) {
      response.sendStatus(404);
      return;
    }

    // TODO: pick an unmarked question and allocate it to paperUser if allocation with paperUser
    // exists and there is still cap
    /* const unMarkedQuestionsOfQuestionTemplate = await getRepository(Question)
      .createQueryBuilder("question")
      .leftJoinAndSelect("question.marks", "mark")
      .where("mark is null")
      .getOne();*/

    const mark = new Mark();
    mark.paperUser = paperUser;
    mark.question = question;
    mark.score = 0;
    await validateOrReject(mark);

    const data = await mark.getData();
    response.status(201).json({ mark: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function update(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const markId = Number(request.params.id);
    const allowed = await allowedMarker(userId, markId);
    if (!allowed) {
      response.sendStatus(404);
      return;
    }
    const postData: Partial<MarkPatchData> = request.body;
    const { score } = postData;

    const mark = await getRepository(Mark).findOneOrFail(markId, {
      where: { discardedAt: IsNull() }
    });

    if (score) {
      mark.score = score;
    }
    await validateOrReject(mark);
    await getRepository(Mark).save(mark);

    const data = await mark.getData();
    response.status(201).json({ mark: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const markId = Number(request.params.id);
    const allowed = await allowedMarker(userId, markId);
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(Mark).update(markId, {
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
    const markId = Number(request.params.id);
    const allowed = await allowedMarker(userId, markId);
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(Mark).update(markId, {
      discardedAt: undefined
    });

    const mark = await getRepository(Mark).findOneOrFail(markId, {
      where: { discardedAt: Not(IsNull()) }
    });

    const data = await mark.getData();
    response.status(200).json({ mark: data });
  } catch (error) {
    response.sendStatus(400);
  }
}
