import jwt from "jsonwebtoken";
import sendgrid from "@sendgrid/mail";
import { MailData } from "@sendgrid/helpers/classes/mail";

import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";
import { ResetPasswordTokenPayload, BearerTokenType } from "../types/tokens";

const APP_NAME = "SoftMark";
const APP_URL = "https://softmark.io";

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
    `<p>To get started, please <a href='${APP_URL}/auth/verify-email/${token}'>verify your email now!</a></p>`;

  send(user, `Welcome to ${APP_NAME}!`, message);
}

export function sendPasswordlessLoginEmail(user: User) {
  const token = user.createAuthorizationToken();

  const message = `<p>You may login using this token ${token}`;

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
    `<p>You may view it by visiting this link ${APP_URL}/login/${token}</p>`;

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
    `<p>But don’t worry! You can <a href='${APP_URL}/auth/reset-password/${token}'>click here to reset your password</a></p>` +
    "<br />" +
    `<p>If you don’t use this link within 3 hours, it will expire. To get a new password reset link, visit ${APP_URL}/auth/reset-password-request</p>` +
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
