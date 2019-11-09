import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  BearerTokenType,
  isAccessTokenSignedPayload,
  isBearerToken,
  isPasswordlessTokenSignedPayload,
  isRefreshTokenSignedPayload,
  isResetPasswordTokenSignedPayload,
  isVerifyEmailTokenSignedPayload
} from "../types/tokens";

export const checkBearerToken = (type: BearerTokenType) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    case BearerTokenType.PasswordlessToken:
      if (!isPasswordlessTokenSignedPayload(payload)) {
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

    case BearerTokenType.ResetPasswordToken:
      if (!isResetPasswordTokenSignedPayload(payload)) {
        res.sendStatus(401);
        return;
      }
      break;

    case BearerTokenType.VerifyEmailToken:
      if (!isVerifyEmailTokenSignedPayload(payload)) {
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
