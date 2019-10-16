import { compareSync, hashSync } from "bcryptjs";
import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import {
  EntityTokenSignedPayload,
  AccessTokenSignedPayload,
  ResetPasswordTokenSignedPayload
} from "../types/tokens";

export async function login(request: Request, response: Response) {
  if (!request.headers.authorization) {
    response.sendStatus(400);
    return;
  }
  const b64auth = request.headers.authorization.split(" ")[1];
  const [email, password] = Buffer.from(b64auth, "base64")
    .toString()
    .split(":");

  const user = await getRepository(User)
    .createQueryBuilder("user")
    .addSelect("user.password")
    .where("user.email = :email", { email })
    .getOne();

  if (
    !user ||
    !user.password ||
    !compareSync(password, user.password) ||
    user.discardedAt
  ) {
    response.sendStatus(400);
    return;
  }

  const result = user.createAuthenticationTokens();
  response.status(200).json(result);
}

export async function refreshAuthentication(
  request: Request,
  response: Response
) {
  const accessTokenSignedPayload = response.locals
    .payload as AccessTokenSignedPayload;

  let user: User;
  try {
    user = await getRepository(User).findOneOrFail(accessTokenSignedPayload.id);
  } catch (error) {
    response.sendStatus(404);
    console.error(error);
    return;
  }
  if (user.discardedAt) {
    response.sendStatus(403);
    return;
  }

  const result = user.createAuthenticationTokens();
  response.status(200).json(result);
}

export async function verifyEmail(request: Request, response: Response) {
  try {
    const entityTokenSignedPayload = response.locals
      .payload as EntityTokenSignedPayload<User>;
    if (!entityTokenSignedPayload.id) {
      throw new Error("No id provided");
    }

    const user = await getRepository(User).findOneOrFail(
      entityTokenSignedPayload.id
    );
    if (user.email !== entityTokenSignedPayload.email) {
      throw new Error("Email has changed");
    }

    const result = await getRepository(User).update(
      entityTokenSignedPayload.id,
      {
        emailVerified: true
      }
    );
    if (result.affected === 0) {
      throw new Error("Failed to update user");
    }

    user.emailVerified = true;
    const authenticationTokens = user.createAuthenticationTokens();
    response.status(204).json(authenticationTokens);
  } catch (error) {
    response.sendStatus(400);
    console.error(error);
  }
}

export async function resetPassword(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as ResetPasswordTokenSignedPayload;
    const newPassword = request.body.newPassword;

    const user = await getRepository(User).findOneOrFail(payload.id);
    user.password = newPassword;
    await validateOrReject(user);

    await getRepository(User).update(payload.id, {
      password: hashSync(newPassword)
    });
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
    console.error(error);
  }
}
