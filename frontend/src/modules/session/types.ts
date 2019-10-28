import { UserData } from "backend/src/types/users";
import { SignInResponseData } from "../../api/auth";

export const SET_CURRENT_TOKEN = "session/SET_CURRENT_TOKEN";
export const SET_CURRENT_USER = "session/SET_CURRENT_USER";

export const LOG_OUT = "session/LOG_OUT";

export interface SET_CURRENT_TOKEN_ACTION {
  type: typeof SET_CURRENT_TOKEN;
  data: SignInResponseData | null;
}

export interface SET_CURRENT_USER_ACTION {
  type: typeof SET_CURRENT_USER;
  data: UserData | null;
}

export interface LOG_OUT_ACTION {
  type: typeof LOG_OUT;
  data: null;
}

export type SESSION_ACTION_TYPES =
  | SET_CURRENT_TOKEN_ACTION
  | SET_CURRENT_USER_ACTION
  | LOG_OUT_ACTION;

export interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserData | null;
}
