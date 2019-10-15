import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import {
  isBearerToken,
  BearerTokenType,
  isAccessTokenSignedPayload,
  isRefreshTokenSignedPayload,
  isEntityTokenSignedPayload,
  isResetPasswordTokenSignedPayload
} from "../types/tokens";

export const checkBearerToken = (
  type: BearerTokenType,
  entityName?: string
) => (req: Request, res: Response, next: NextFunction) => {
  const bearerToken = req.headers.authorization;
  if (!bearerToken || !isBearerToken(bearerToken)) {
    res.sendStatus(401);
    return;
  }

  const token = bearerToken.split(" ")[1];

  let payload: object | string;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    res.sendStatus(401);
    return;
  }

  switch (type) {
    case BearerTokenType.AccessToken:
      if (!isAccessTokenSignedPayload(payload)) {
        res.sendStatus(401);
        return;
      }
      break;

    case BearerTokenType.RefreshToken:
      if (!isRefreshTokenSignedPayload(payload)) {
        res.sendStatus(401);
        return;
      }
      break;

    case BearerTokenType.EntityToken:
      if (
        !isEntityTokenSignedPayload(payload) ||
        !entityName ||
        payload.entityName !== entityName
      ) {
        res.sendStatus(401);
        return;
      }
      break;

    case BearerTokenType.ResetPasswordToken:
      if (!isResetPasswordTokenSignedPayload(payload)) {
        res.sendStatus(401);
        return;
      }
      break;

    default:
      res.sendStatus(401);
      return;
  }

  res.locals.payload = payload;

  next();
};
