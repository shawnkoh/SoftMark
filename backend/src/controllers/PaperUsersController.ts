import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository, IsNull, Not } from "typeorm";
import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";
import {
  PaperUserPostData,
  PaperUserRole,
  PaperUserPatchData
} from "../types/paperUsers";
import { allowedRequester } from "../utils/papers";
import { sendNewPaperUserEmail } from "../utils/sendgrid";

export async function create(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const paperId = request.params.id;
    const allowed = await allowedRequester(
      payload.id,
      paperId,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }
    const { paper } = allowed;
    const { email, role } = request.body as PaperUserPostData;

    let user = await getRepository(User).findOne({ email });
    const hasUser = !!user;
    if (!user) {
      user = new User(email);
      await validateOrReject(user);
    }

    const paperUser = new PaperUser(paper, user, role);
    await validateOrReject(paperUser);

    if (!hasUser) {
      await getRepository(User).save(user);
    }
    await getRepository(PaperUser).save(paperUser);

    const data = await paperUser.getData();
    sendNewPaperUserEmail(paperUser);
    response.status(201).json({ paperUser: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function update(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const paperUserId = Number(request.params.id);
    const paperUser = await getRepository(PaperUser).findOne(paperUserId, {
      where: { discardedAt: IsNull() }
    });
    if (!paperUser) {
      response.sendStatus(404);
      return;
    }
    const allowed = await allowedRequester(
      userId,
      paperUser.paperId,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    const patchData = request.body as PaperUserPatchData;
    if (patchData.role) {
      paperUser.role = patchData.role;
    }

    await validateOrReject(paperUser);
    await getRepository(PaperUser).save(paperUser);

    const data = await paperUser.getData();
    response.status(201).json({ paperUser: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const paperUserId = Number(request.params.id);
    const paperUser = await getRepository(PaperUser).findOne(paperUserId, {
      where: { discardedAt: IsNull() }
    });
    if (!paperUser) {
      response.sendStatus(404);
      return;
    }
    const allowed = await allowedRequester(
      userId,
      paperUser.paperId,
      PaperUserRole.Owner
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
    const paperUser = await getRepository(PaperUser).findOne(paperUserId);
    if (!paperUser) {
      response.sendStatus(404);
      return;
    }
    const allowed = await allowedRequester(
      userId,
      paperUser.paperId,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(PaperUser).update(paperUserId, { discardedAt: null });
    paperUser.discardedAt = null;

    const data = await paperUser.getData();
    response.status(200).json({ paperUser: data });
  } catch (error) {
    response.sendStatus(400);
  }
}
