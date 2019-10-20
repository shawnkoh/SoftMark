import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository, IsNull, Not } from "typeorm";
import { Mark } from "../entities/Mark";
import { PaperUser } from "../entities/PaperUser";
import { Question } from "../entities/Question";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedMarker } from "../utils/marks";
import { MarkPostData, MarkPatchData } from "../types/marks";

export async function create(request: Request, response: Response) {
    try {
        const payload = response.locals.payload as AccessTokenSignedPayload;
        const userId = payload.id;
        const questionId = Number(request.params.id);
        const postData: MarkPostData = request.body;
        const { paperUserId } = postData;
       
        //ToDO: permissions
       /* const allowed = await allowedMarker(userId, paperUserId);
        if (!allowed) {
            response.sendStatus(404);
            return;
        }*/
    
        const mark = new Mark();
        mark.paperUser = await getRepository(PaperUser).findOneOrFail(paperUserId);
        mark.question = await getRepository(Question).findOneOrFail(questionId);
        mark.score = 0;
        await validateOrReject(mark);

        const data = await mark.getData();
        response.status(201).json(data);
      } catch (error) {
        console.log(error);
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
    response.status(201).json(data);
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
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}
