import {
  applyMiddleware,
  combineReducers,
  createStore,
  Middleware,
  Reducer
} from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import authReducer from "./auth";

const rootReducer: Reducer<{}> = combineReducers<{}>({
  auth: authReducer
});

const middlewares: Middleware[] = [thunk];

if (process.env.NODE_ENV === "development") {
  middlewares.push(logger);
}

export default function configureStore() {
  return createStore(rootReducer, applyMiddleware(...middlewares));
}
