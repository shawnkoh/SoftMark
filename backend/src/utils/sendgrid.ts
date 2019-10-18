import * as jwt from "jsonwebtoken";
import * as sendgrid from "@sendgrid/mail";
import { MailData } from "@sendgrid/helpers/classes/mail";
import { User } from "../entities/User";
import { Script } from "../entities/Script";
import { PaperUser } from "../entities/PaperUser";
import {
  AccessTokenSignedPayload,
  BearerTokenType,
  ResetPasswordTokenPayload
} from "../types/tokens";

const baseUrl = "https://nus.reviews";

export function sendVerificationEmail(user: User) {
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

  const payload = user.createPayload();

  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7 days"
  });

  const message =
    "<p>Welcome aboard!</p>" +
    "<p>We're excited that you're joining us! Because we're here to help you make marking exams great again, we want to get you up to speed quickly so that you can make the most of everything at cs3216-final-project</P>" +
    `<p>To get started, please <a href='${baseUrl}/auth/verify-email/${token}'>verify your email now!</a></p>`;

  const msg: MailData = {
    to: user.email,
    from: "mail@nus.reviews",
    subject: "Welcome to cs3216-final-project!",
    html: message
  };
  sendgrid.send(msg);
}

export function sendInviteEmail(paperUser: PaperUser) {}

export function sendResetPasswordEmail(user: User) {
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

  const payload: ResetPasswordTokenPayload = {
    type: BearerTokenType.ResetPasswordToken,
    ...user.getCredentials()
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "3 hours"
  });

  const message =
    "<p>We heard that you lost your cs3216-final-project password. Sorry about that!</p>" +
    `<p>But don’t worry! You can <a href='${baseUrl}/auth/reset-password/${token}'>click here to reset your password</a></p>` +
    "<br />" +
    `<p>If you don’t use this link within 3 hours, it will expire. To get a new password reset link, visit ${baseUrl}/auth/reset-password-request</p>` +
    "<br />" +
    "<p>Thanks,<br />" +
    "The cs3216-final-project team`</p>";

  const data: MailData = {
    to: user.email,
    from: "mail@nus.reviews",
    subject: "[cs3216-final-project] Please reset your password",
    text: message,
    html: message
  };

  sendgrid.send(data);
}

export function sendScriptEmail(
  accessTokenSignedPayload: AccessTokenSignedPayload,
  script: Script
) {
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

  const token = jwt.sign(script.createPayload(), process.env.JWT_SECRET!, {
    expiresIn: "7 days"
  });

  const message =
    `<p>Dear ...</p>` +
    "<p>You may view your [paper] script here.</p>" +
    "<p>Please take note that you will not be able to view your script should you lose this special link.</p>" +
    "<br />" +
    `<p>You may view it by <a href='${baseUrl}/scripts/${token}'>clicking on this link</a></p>`;

  const msg: MailData = {
    to: accessTokenSignedPayload.email,
    from: "mail@nus.reviews",
    subject: `[cs3216-final-project] View your [Paper] marks here!`,
    text: message,
    html: message
  };
  sendgrid.send(msg);
}
