import { hashSync, compareSync } from "bcryptjs";
import { validateOrReject, validate } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getRepository, IsNull } from "typeorm";
import { User } from "../entities/User";
import {
  AccessTokenSignedPayload,
  ResetPasswordTokenSignedPayload,
  VerifyEmailTokenSignedPayload
} from "../types/tokens";
import {
  sendVerificationEmail,
  sendResetPasswordEmail
} from "../utils/sendgrid";

export async function create(request: Request, response: Response) {
  try {
    const { email, password, name } = pick(
      request.body,
      "email",
      "password",
      "name"
    );
    const user = new User(email, password, name);
    await validateOrReject(user);

    if (user.password) {
      user.password = hashSync(user.password!);
    }
    await getRepository(User).save(user);

    sendVerificationEmail(user);

    const data = {
      user: user.getData(),
      ...user.createAuthenticationTokens()
    };
    response.status(201).json({ user: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function showSelf(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;

  let user: User;
  try {
    user = await getRepository(User).findOneOrFail(userId, {
      where: { discardedAt: IsNull() }
    });
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    const data = user.getData();
    response.status(200).json({ user: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function updateSelf(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;
  let user: User;
  try {
    user = await getRepository(User).findOneOrFail(userId, {
      where: { discardedAt: IsNull() }
    });
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    Object.assign(user, pick(request.body, "name"));
    await getRepository(User).save(user);

    const data = user.getData();
    response.status(200).json({ user: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function changePassword(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;

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
    .where("user.id = :userId", { userId })
    .getOne();

  if (!user || !user.password || !compareSync(oldPassword, user.password)) {
    response.sendStatus(400);
    return;
  }

  try {
    user.password = newPassword;
    await validateOrReject(user);
    await repo.update(userId, { password: hashSync(newPassword) });
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function requestResetPassword(
  request: Request,
  response: Response
) {
  const email = request.body.email;
  if (!email) {
    response.sendStatus(404);
    return;
  }
  const user = await getRepository(User).findOne({
    where: { email }
  });
  if (!user) {
    response.sendStatus(404);
    return;
  }

  sendResetPasswordEmail(user);
  response.sendStatus(204);
}

export async function resetPassword(request: Request, response: Response) {
  const payload = response.locals.payload as ResetPasswordTokenSignedPayload;
  const { userId } = payload;
  const password = request.body.password;

  const user = await getRepository(User).findOne(userId);
  if (!user) {
    response.sendStatus(404);
    return;
  }
  user.password = password;
  const errors = await validate(user);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  user.password = hashSync(password);

  await getRepository(User).save(user);
  response.sendStatus(204);
}

export async function verifyEmail(request: Request, response: Response) {
  const payload = response.locals.payload as VerifyEmailTokenSignedPayload;
  const { userId } = payload;

  const user = await getRepository(User).findOne(userId);
  if (!user) {
    response.sendStatus(404);
    return;
  }

  user.emailVerified = true;
  const errors = await validate(user);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }

  await getRepository(User).save(user);
  response.sendStatus(204);
}
