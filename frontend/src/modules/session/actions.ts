import * as types from "./types";
import { SignInResponseData } from "../../api/auth";
import { UserData } from "backend/src/types/users";

export function setCurrentUser(
  data: UserData | null
): types.SET_CURRENT_USER_ACTION {
  return {
    type: types.SET_CURRENT_USER,
    data
  };
}

export function setCurrentToken(
  data: SignInResponseData | null
): types.SET_CURRENT_TOKEN_ACTION {
  return {
    type: types.SET_CURRENT_TOKEN,
    data
  };
}

export function logOut(): types.LOG_OUT_ACTION {
  return {
    type: types.LOG_OUT,
    data: null
  };
}
