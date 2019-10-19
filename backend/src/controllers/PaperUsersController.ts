import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";
import { PaperUserPostData, PaperUserRole } from "../types/paperUsers";
import { allowedPaperUser } from "../utils/papers";

export async function create(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const paperId = request.params.id;
    const allowed = await allowedPaperUser(
      userId,
      Number(paperId),
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    const postData : PaperUserPostData = request.body;

    const userEmail = postData.email;
    const user = await getRepository(User).findOneOrFail({ email: userEmail });

    const paper = await getRepository(Paper).findOneOrFail(paperId);
    await validateOrReject(paper);

    const paperUser = new PaperUser();
    paperUser.paper = paper;
    paperUser.user = user;
    paperUser.role = postData.role;
    await validateOrReject(paperUser);

    await getRepository(PaperUser).save(paperUser);

    response.status(201).json(paperUser);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function update(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    

    response.status(200);//.json(paperUser);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const allowed = await allowedPaperUser(
      payload.id,
      Number(request.params.id),
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(PaperUser).update(request.params.id, {
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
    const allowed = await allowedPaperUser(
      payload.id,
      Number(request.params.id),
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }
    const { paperUser } = allowed;

    await getRepository(PaperUser).update(request.params.id, {
      discardedAt: undefined
    });

    response.status(200).json(paperUser);
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}
