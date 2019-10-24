import { AppState } from "../../types/store";
import { UserData } from "backend/src/types/users";

function getLocalState(state: AppState) {
  return state.session;
}

export function getCurrentUser(state: AppState): UserData | null {
  return getLocalState(state).user;
}

export function getCurrentAccessToken(state: AppState): string | null {
  return getLocalState(state).accessToken;
}

export function isLoggedIn(state: AppState): boolean {
  return !!getCurrentAccessToken(state);
}
