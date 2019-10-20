import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository, IsNull, Not } from "typeorm";
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

    const postData: PaperUserPostData = request.body;

    const email = postData.email;
    let user = await getRepository(User).findOne({ email: email });
    if (!user) {
      user = new User();
      user.email = email;
    }
    await validateOrReject(user);

    const paper = await getRepository(Paper).findOneOrFail(paperId);
    await validateOrReject(paper);

    const paperUser = new PaperUser();
    paperUser.paper = paper;
    paperUser.user = user;
    paperUser.role = postData.role;
    await validateOrReject(paperUser);

    await getRepository(User).save(user);
    await getRepository(PaperUser).save(paperUser);

    const data = await paperUser.getData();
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
    const paperUserId = Number(request.params.id);
    const paperUser = await getRepository(PaperUser).findOneOrFail(paperUserId, { where: { discardedAt: IsNull() }} );
    const postData: Partial<PaperUserPostData> = request.body;
    const { role } = postData;
    const allowed = await allowedPaperUser(
      userId,
      paperUser.paperId,
      role
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }
   
    if (role) {
      paperUser.role = role;
    }
    await validateOrReject(paperUser);
    await getRepository(PaperUser).save(paperUser);

    const data = await paperUser.getData();
    response.status(201).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const paperUserId = Number(request.params.id);
    const paperUser = await getRepository(PaperUser).findOneOrFail(paperUserId, { where: { discardedAt: IsNull() }} );
    const allowed = await allowedPaperUser(
      userId,
      paperUser.paperId
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
    const userId = payload.id;
    const paperUserId = Number(request.params.id);    
    let paperUser = await getRepository(PaperUser).findOneOrFail(paperUserId, { where: { discardedAt: Not(IsNull()) }} );
    console.log(paperUser);
    const allowed = await allowedPaperUser(
      userId,
      paperUser.paperId
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(PaperUser).update(paperUserId, {
      discardedAt: undefined
    });

    paperUser = await getRepository(PaperUser).findOneOrFail(paperUserId);
    const data = await paperUser.getData();
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}
