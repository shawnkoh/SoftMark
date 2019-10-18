import * as jwt from "jsonwebtoken";
import * as sendgrid from "@sendgrid/mail";
import { MailData } from "@sendgrid/helpers/classes/mail";
import { User } from "../entities/User";
import { PaperUser } from "../entities/PaperUser";
import { BearerTokenType, ResetPasswordTokenPayload } from "../types/tokens";

const baseUrl = "https://nus.reviews";

function send(user: User, subject: string, message: string) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
  const data: MailData = {
    to: user.email,
    from: "mail@nus.reviews",
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
    "<p>We're excited that you're joining us! Because we're here to help you make marking exams great again, we want to get you up to speed quickly so that you can make the most of everything at cs3216-final-project</P>" +
    `<p>To get started, please <a href='${baseUrl}/auth/verify-email/${token}'>verify your email now!</a></p>`;

  send(user, "Welcome to cs3216-final-project!", message);
}

export function sendPasswordlessLoginEmail(user: User) {
  const token = user.createAuthorizationToken();

  const message = `<p>You may login using this token ${token}`;

  send(user, "[cs3216-final-project] Passwordless Login", message);
}

export function sendInviteEmail(paperUser: PaperUser) {}

export function sendResetPasswordEmail(user: User) {
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

  send(user, "[cs3216-final-project] Please reset your password", message);
}

export function sendScriptEmail(user: User) {
  const token = user.createAuthorizationToken();

  const message =
    `<p>Dear ...</p>` +
    "<p>You may view your [paper] script here.</p>" +
    "<br />" +
    `<p>You may view it by <a href='${baseUrl}/scripts/${token}'>clicking on this link</a></p>` +
    `<p>Alternatively, you may log into your email at ...URL... to view the script</p>`;

  send(user, "[cs3216-final-project] View your [Paper] marks here!", message);
}
