
import { StylesProvider } from "@material-ui/styles";
import React, { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "../components/LoadingSpinner";
import { getUser } from "./auth/selectors";
import configureStore from "./store";

const store = configureStore();
toast.configure();
const loadAuthenticatedApp = () => import("./AuthenticatedApp");
const AuthenticatedApp = React.lazy(() => import("./AuthenticatedApp"));
const UnauthenticatedApp = React.lazy(() => import("./UnauthenticatedApp"));

const ActiveApp: React.FC = () => {
  const user = useSelector(getUser);

  useEffect(() => {
    loadAuthenticatedApp();
  });

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </React.Suspense>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      {/* <MuiThemeProvider theme={theme}> */}
      <StylesProvider injectFirst>
        <BrowserRouter>
          <ActiveApp />
        </BrowserRouter>
      </StylesProvider>
      {/* </MuiThemeProvider> */}
    </Provider>
  );
};

export default App;
