import { types as auth } from "../store/auth";

/**
 * Describes the overall shape of the application's Redux store state.
 */
export interface AppState {
  auth: auth.AuthState;
}
