import { types as auth } from "../modules/auth";

/**
 * Describes the overall shape of the application's Redux store state.
 */
export interface AppState {
  auth: auth.AuthState;
}
