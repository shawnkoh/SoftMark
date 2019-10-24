import { types as session } from "../modules/session";

/**
 * Describes the overall shape of the application's Redux store state.
 */
export interface AppState {
  session: session.SessionState;
}
