import React from "react";
import { Provider, useSelector } from "react-redux";
import { CssBaseline } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { StylesProvider } from "@material-ui/styles";
import { BrowserRouter } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import configureStore from "./store";
import { getUser } from "./auth/selectors";
import theme from "../theme";
import SnackbarProvider from "../components/snackbar/SnackbarProvider";
import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect } from "react";

const store = configureStore();
toast.configure();
const loadAuthenticatedApp = () => import("./main/AuthenticatedApp");
const AuthenticatedApp = React.lazy(() => import("./main/AuthenticatedApp"));
const UnauthenticatedApp = React.lazy(() =>
  import("./auth/components/UnauthenticatedApp")
);

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
        <SnackbarProvider>
          <CssBaseline />
          <BrowserRouter>
            <ActiveApp />
          </BrowserRouter>
        </SnackbarProvider>
      </StylesProvider>
      {/* </MuiThemeProvider> */}
    </Provider>
  );
};

export default App;
