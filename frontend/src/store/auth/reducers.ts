import * as types from "./types";
import { setAccessToken, setRefreshToken } from "../../localStorage";

const initialState: types.AuthState = {
  user: null
};

const reducer = (
  state: types.AuthState = initialState,
  action: types.AuthActionTypes
) => {
  switch (action.type) {
    case types.SET_USER:
      if (!action.data) {
        return {
          ...initialState
        };
      }

      const currentUser = action.data;
      state.user = currentUser;

      return {
        ...state,
        ...action.data
      };

    case types.LOG_OUT:
      state.user = null;
      setAccessToken(null);
      setRefreshToken(null);

      return {
        ...state
      };

    default:
      return state;
  }
};

export default reducer;
