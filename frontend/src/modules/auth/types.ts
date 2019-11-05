import { UserData } from "backend/src/types/users";

export const SET_USER = "auth/SET_USER";
export const SIGN_IN = "auth/SIGN_IN";
export const LOG_OUT = "auth/LOG_OUT";

export interface SetUserAction {
  type: typeof SET_USER;
  data: UserData | null;
}

export interface SignInAction {
  type: typeof SIGN_IN;
  data: null;
}

export interface LogOutAction {
  type: typeof LOG_OUT;
  data: null;
}

export type AuthActionTypes = SetUserAction | LogOutAction;

export interface AuthState {
  user: UserData | null;
}
