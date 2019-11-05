import { compareSync } from "bcryptjs";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { verify } from "jsonwebtoken";
import { User } from "../entities/User";
import {
  isRefreshTokenSignedPayload,
  isAuthorizationTokenPayload
} from "../types/tokens";
import { sendPasswordlessLoginEmail } from "../utils/sendgrid";

export async function passwordless(request: Request, response: Response) {
  // Check whether a user has a password. If no password, send passwordless login email
  const email = request.body.email;
  if (!email) {
    response.sendStatus(400);
    return;
  }
  const user = await getRepository(User)
    .createQueryBuilder("user")
    .addSelect("user.password")
    .where("user.email = :email", { email })
    .andWhere("user.discardedAt is null")
    .getOne();

  if (!user) {
    response.sendStatus(404);
    return;
  }

  if (user.password) {
    response.status(403).send("User has password");
    return;
  }

  sendPasswordlessLoginEmail(user);
  response.status(201).send("Sent passwordless login email");
}

export async function token(request: Request, response: Response) {
  try {
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new Error("No valid input");
    }

    const [type, token] = authorization.split(" ");

    // Try to login using username and password
    if (type === "Basic") {
      const [email, password] = Buffer.from(token, "base64")
        .toString()
        .split(":");

      const user = await getRepository(User)
        .createQueryBuilder("user")
        .addSelect("user.password")
        .where("user.email = :email", { email })
        .andWhere("user.discardedAt is null")
        .getOne();

      if (!user || !user.password || !compareSync(password, user.password)) {
        throw new Error();
      }

      const data = user.createAuthenticationTokens();
      response.status(200).json(data);
      return;
    }

    // Try to refresh tokens
    if (type !== "Bearer") {
      throw new Error("No valid input");
    }

    const payload = verify(token, process.env.JWT_SECRET!);

    if (
      !isAuthorizationTokenPayload(payload) &&
      !isRefreshTokenSignedPayload(payload)
    ) {
      throw new Error("No valid input");
    }

    const user = await getRepository(User).findOneOrFail(payload.id);
    const data = user.createAuthenticationTokens();
    response.status(200).json(data);
  } catch (error) {
    console.error(error);
    response.sendStatus(400);
  }
}
