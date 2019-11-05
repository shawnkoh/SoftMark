import { validateOrReject, validate } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getRepository, IsNull, getManager } from "typeorm";

import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";
import { PaperUserPostData, PaperUserRole } from "../types/paperUsers";
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
    const { email, role, matriculationNumber, name } = request.body as PaperUserPostData;

    const storedUser = await getRepository(User).findOne({ email });
    const user = storedUser ? storedUser : new User(email);
    if (name || name === "") {
      user.name = name;
    }
    await validateOrReject(user);

    const paperUser = new PaperUser(paper, user, role);
    if (matriculationNumber) {
      paperUser.matriculationNumber = matriculationNumber;
    }
    await validateOrReject(paperUser); //TODO: need to add uniqueness check to students

    await getManager().transaction(async manager => {
      await getRepository(User).save(user);
      await getRepository(PaperUser).save(paperUser);
    });
    
    const data = await paperUser.getData();
    sendNewPaperUserEmail(paperUser);
    response.status(201).json({ paperUser: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.id;
  const paperUserId = request.params.id;
  const paperUser = await getRepository(PaperUser).findOne(paperUserId, {
    where: { discardedAt: IsNull() }
  });
  if (!paperUser) {
    response.sendStatus(404);
    return;
  }
  const allowed = await allowedRequester(
    requesterId,
    paperUser.paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  Object.assign(paperUser, pick(request.body, "role", "matriculationNumber"));
  const errors = await validate(paperUser);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(PaperUser).save(paperUser);

  const data = await paperUser.getData();
  response.status(201).json({ paperUser: data });
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
