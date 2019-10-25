import {
  applyMiddleware,
  combineReducers,
  createStore,
  Middleware,
  Reducer
} from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import sessionReducer from "./session";

const rootReducer: Reducer<{}> = combineReducers<{}>({
  session: sessionReducer
});

const middlewares: Middleware[] = [thunk];

if (process.env.NODE_ENV === "development") {
  middlewares.push(logger);
}

export default function configureStore() {
  return createStore(rootReducer, applyMiddleware(...middlewares));
}
