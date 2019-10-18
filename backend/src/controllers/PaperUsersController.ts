import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";
import { PaperUserPostData, PaperUserRole } from "../types/paperUsers";
import { allowedPaperUser } from "../utils/papers";
import { allowedToEditPaperUser } from "../utils/paperUsers";

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

    const postData: PaperUserPostData = request.body;

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

    const data = await paperUser.getListData();
    response.status(201).json(data);
  } catch (error) {
    console.log(error);
    response.sendStatus(400);
  }
}

export async function update(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const paperUserId = Number(request.params.id);
    const allowed = await allowedToEditPaperUser(
      payload.id,
      paperUserId
    );

    if (!allowed) {
      response.sendStatus(404);
      return;
    }
   
    const paperUser = await getRepository(PaperUser).findOneOrFail(paperUserId);
    const postData: Partial<PaperUserPostData> = request.body;
    const { role } = postData;

    if (role) {
      paperUser.role = role;
    }

    await validateOrReject(paperUser);
    await getRepository(PaperUser).save(paperUser);

    const data = await paperUser.getListData();
    response.status(201).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const paperUserId = Number(request.params.id);
    const allowed = await allowedToEditPaperUser(
      payload.id,
      paperUserId
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(PaperUser).update(paperUserId, {
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
    const paperUserId = Number(request.params.id);
    const paperUser = await getRepository(PaperUser).findOneOrFail(paperUserId);
    const allowed = await allowedToEditPaperUser(
      payload.id,
      paperUserId,
      true
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(PaperUser).update(paperUserId, {
      discardedAt: undefined
    });
    
    const data = await paperUser.getListData();
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}
