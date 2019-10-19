import { hashSync, compareSync } from "bcryptjs";
import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";
import {
  sendVerificationEmail,
  sendResetPasswordEmail
} from "../utils/sendgrid";

export async function create(request: Request, response: Response) {
  try {
    const user = new User();
    Object.assign(user, pick(request.body, "email", "password", "name"));
    await validateOrReject(user);

    user.password = hashSync(user.password!);
    await getRepository(User).save(user);

    sendVerificationEmail(user);

    const data = {
      user: user.getData(),
      ...user.createAuthenticationTokens()
    };
    response.status(201).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function changePassword(request: Request, response: Response) {
  const accessTokenSignedPayload = response.locals
    .payload as AccessTokenSignedPayload;
  const id = accessTokenSignedPayload.id;

  const oldPasswordB64 = request.body.oldPassword;
  const newPasswordB64 = request.body.newPassword;

  if (
    typeof oldPasswordB64 !== "string" ||
    typeof newPasswordB64 !== "string"
  ) {
    response.sendStatus(400);
    return;
  }

  const oldPassword = Buffer.from(oldPasswordB64, "base64").toString();
  const newPassword = Buffer.from(newPasswordB64, "base64").toString();

  const repo = getRepository(User);
  const user = await repo
    .createQueryBuilder("user")
    .addSelect("user.password")
    .where("user.id = :id", { id })
    .getOne();

  if (!user || !user.password || !compareSync(oldPassword, user.password)) {
    response.sendStatus(400);
    return;
  }

  try {
    user.password = newPassword;
    await validateOrReject(user);
    await repo.update(id, { password: hashSync(newPassword) });
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function requestResetPassword(
  request: Request,
  response: Response
) {
  try {
    const email = request.body.email;

    const user = await getRepository(User).findOneOrFail({
      where: { email }
    });

    sendResetPasswordEmail(user);
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(404);
  }
}
