import { UserData } from "backend/src/types/users";

import { AppState } from "../../types/store";

function getLocalState(state: AppState) {
  return state.auth;
}

export function getUser(state: AppState): UserData | null {
  return getLocalState(state).user;
}
