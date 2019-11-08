import jwt from "jsonwebtoken";
import sendgrid from "@sendgrid/mail";
import { MailData } from "@sendgrid/helpers/classes/mail";

import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";
import { ResetPasswordTokenPayload, BearerTokenType } from "../types/tokens";

const APP_NAME = "SoftMark";
const APP_URL = "https://softmark.io";
const LOGIN_URL = `${APP_URL}/login`;
const PASSWORD_RESET_URL = `${APP_URL}/reset_password`;
const AUTH_PASSWORD_RESET_URL = `${APP_URL}/auth/reset_password`;
const AUTH_PASSWORDLESS_URL = `${APP_URL}/auth/passwordless`;
const VERIFY_EMAIL_URL = `${APP_URL}/auth/verify_email`;

function send(user: User, subject: string, message: string) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
  const data: MailData = {
    to: user.email,
    from: "mail@softmark.io",
    subject,
    text: message,
    html: message
  };
  sendgrid.send(data);
}

export function sendVerificationEmail(user: User) {
  const payload = user.createPayload();
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7 days"
  });

  const message =
    "<p>Welcome aboard!</p>" +
    "<p>We're excited that you're joining us! Because we're here to help you make marking exams great again, we want to get you up to speed quickly so that you can make the most of everything at ${APP_NAME}</P>" +
    `<p>To get started, please <a href='${VERIFY_EMAIL_URL}/${token}'>verify your email now!</a></p>`;

  send(user, `Welcome to ${APP_NAME}!`, message);
}

export function sendPasswordlessLoginEmail(user: User) {
  const token = user.createAuthorizationToken();

  const message = `<p>You may login by visiting <a href='${AUTH_PASSWORDLESS_URL}/${token}'>this link</a></p>`;

  send(user, `[${APP_NAME}] Passwordless Login`, message);
}

export function sendNewPaperUserEmail(paperUser: PaperUser) {
  const { paper, user } = paperUser;
  if (!paper || !user) {
    throw new Error("paperUser is not loaded properly");
  }
  const token = user.createAuthorizationToken();

  const message =
    `<p>You have been invited as a ${paperUser.role} to ${paper.name}</p>` +
    "<br />" +
    `<p>You may view it by visiting this link ${LOGIN_URL}/${token}</p>`;

  send(user, `[${APP_NAME}] Invitation to join`, message);
}

export function sendResetPasswordEmail(user: User) {
  const payload: ResetPasswordTokenPayload = {
    type: BearerTokenType.ResetPasswordToken,
    ...user.getCredentials()
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "3 hours"
  });

  const message =
    `<p>We heard that you lost your ${APP_NAME} password. Sorry about that!</p>` +
    `<p>But don’t worry! You can <a href='${AUTH_PASSWORD_RESET_URL}/${token}'>click here to reset your password</a></p>` +
    "<br />" +
    `<p>If you don’t use this link within 3 hours, it will expire. To get a new password reset link, visit ${PASSWORD_RESET_URL}</p>` +
    "<br />" +
    "<p>Thanks,<br />" +
    `The ${APP_NAME} team</p>`;

  send(user, `[${APP_NAME}] Please reset your password`, message);
}

export function sendScriptEmail(paperUser: PaperUser) {
  const { paper, user } = paperUser;
  if (!paper || !user) {
    throw new Error("paperUser is not loaded properly");
  }
  const token = user.createAuthorizationToken();

  const message =
    `<p>Dear ${user.name || "User"}</p>` +
    `<p>You may view your [${paper.name}] script here.</p>` +
    "<br />" +
    `<p>You may view it by <a href='${APP_URL}/scripts/${token}'>clicking on this link</a></p>` +
    `<p>Alternatively, you may log into your email at ...URL... to view the script</p>`;

  send(user, `[${APP_NAME}] View your [Paper] marks here!`, message);
}
