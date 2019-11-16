import { MailData } from "@sendgrid/helpers/classes/mail";
import sendgrid from "@sendgrid/mail";
import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";

const APP_NAME = "SoftMark";
const APP_URL =
  process.env.NODE_ENV === "production"
    ? "https://softmark.io"
    : "http://localhost:3000";

const LOGIN_URL = `${APP_URL}/login`;
const PASSWORD_RESET_URL = `${APP_URL}/reset_password`;

const AUTH_PASSWORDLESS_URL = `${APP_URL}/auth/passwordless`;

const USERS_PASSWORD_RESET_URL = `${APP_URL}/users/reset_password`;
const VERIFY_EMAIL_URL = `${APP_URL}/users/verify_email`;

const INVITE_URL = `${APP_URL}/invite`;

function send(user: User, subject: string, message: string) {
  if (!process.env.SENDGRID_API_KEY) {
    return;
  }

  sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
  const data: MailData = {
    to: user.email,
    from: "no-reply@softmark.io",
    subject,
    text: message,
    html: message
  };
  sendgrid.send(data);
}

export function sendVerificationEmail(user: User) {
  const token = user.createVerifyEmailToken();

  const message =
    "<p>Welcome aboard!</p>" +
    `<p>We're excited that you're joining us! Because we're here to help you make marking exams great again, we want to get you up to speed quickly so that you can make the most of everything at ${APP_NAME}</P>` +
    `<p>To get started, please <a href='${VERIFY_EMAIL_URL}/${token}'>verify your email now!</a></p>`;

  send(user, `Welcome to ${APP_NAME}!`, message);
}

export function sendPasswordlessLoginEmail(user: User) {
  const token = user.createPasswordlessToken();

  const message = `<p>You may login by visiting <a href='${AUTH_PASSWORDLESS_URL}/${token}'>this link</a></p>`;

  send(user, `[${APP_NAME}] Passwordless Login`, message);
}

export function sendInviteEmail(paperUser: PaperUser, expiresIn: string) {
  const { paper, user } = paperUser;
  if (!paper || !user) {
    throw new Error("paperUser is not loaded properly");
  }
  const token = paperUser.createInviteToken("14d");

  const message =
    `<p>You have been invited as a ${paperUser.role} to ${paper.name}</p>` +
    "<br />" +
    `<p>You may view it by <a href='${INVITE_URL}/${token}'>visiting this link</a></p>`;

  send(user, `[${APP_NAME}] Invitation to join`, message);
}

export function sendResetPasswordEmail(user: User) {
  const token = user.createResetPasswordToken();

  const message =
    `<p>We heard that you lost your ${APP_NAME} password. Sorry about that!</p>` +
    `<p>But don’t worry! You can <a href='${USERS_PASSWORD_RESET_URL}/${token}'>click here to reset your password</a></p>` +
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
  const token = paperUser.createInviteToken("7d"); // TODO: change this

  const message =
    `<p>Dear ${user.name || "User"}</p>` +
    `<p>You may view your [${paper.name}] script here.</p>` +
    "<br />" +
    `<p>You may view it by <a href='${APP_URL}/scripts/${token}'>clicking on this link</a></p>` +
    `<p>Alternatively, you may log into your email at ${LOGIN_URL} to view the script</p>`;

  send(user, `[${APP_NAME}] View your ${paper.name} marks here!`, message);
}
