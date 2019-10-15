import { Request, Response, NextFunction } from "express";
import { AccessTokenSignedPayload } from "../types/tokens";

export const checkEmailVerified = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = res.locals.payload as AccessTokenSignedPayload;

  if (payload.emailVerified) {
    next();
  } else {
    res.sendStatus(403);
  }
};
