import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";

export async function checkEmailVerified(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const payload = res.locals.payload as AccessTokenSignedPayload;
  const user = await getRepository(User).findOne(payload.userId);
  if (!user) {
    res.sendStatus(404);
    return;
  }

  if (!user.emailVerified) {
    res.sendStatus(403);
    return;
  }

  next();
}
