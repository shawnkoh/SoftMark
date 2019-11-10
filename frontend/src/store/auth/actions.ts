import * as types from "./types";
import { UserData } from "backend/src/types/users";

export function setUser(data: UserData | null): types.SetUserAction {
  return {
    type: types.SET_USER,
    data
  };
}

export function logOut(): types.LogOutAction {
  return {
    type: types.LOG_OUT,
    data: null
  };
}
