import React, { useEffect } from "react";
import { Provider } from "react-redux";
import configureStore from "./store";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { StylesProvider } from "@material-ui/styles";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ReactGA from "react-ga";

import theme from "../theme";
import SignInPage from "./session/components/SignInPage";
import ForgotPassword from "./session/components/ForgotPasswordPage";
import SignUpPage from "./session/components/SignUpPage";
import SnackbarProvider from "../components/snackbar/SnackbarProvider";
import MainApplicationPages from "../components/layouts/MainAppPages";
import AuthenticationPages from "../components/layouts/AuthenticationPages";
import ResetPassword from "./session/components/ResetPasswordPage";
import VerifyAccountPage from "./session/components/VerifyAccountPage";

const store = configureStore();

const App: React.FC = () => {
  const loginRoute = (
    <Route
      exact
      path="/login"
      render={props => (
        <AuthenticationPages {...props} redirectComponent={SignInPage} />
      )}
    />
  );
  const forgotPasswordRoute = (
    <Route
      exact
      path="/forgotpassword"
      render={props => (
        <AuthenticationPages {...props} redirectComponent={ForgotPassword} />
      )}
    />
  );
  const signUpRoute = (
    <Route
      exact
      path="/signup"
      render={props => (
        <AuthenticationPages {...props} redirectComponent={SignUpPage} />
      )}
    />
  );
  const resetPasswordRoute = (
    <Route
      exact
      path="/resetpassword"
      render={props => (
        <AuthenticationPages {...props} redirectComponent={ResetPassword} />
      )}
    />
  );

  const verifyAccountRoute = (
    <Route
      exact
      path="/verifyaccount"
      render={props => (
        <AuthenticationPages {...props} redirectComponent={VerifyAccountPage} />
      )}
    />
  );
  const mainAppRoutes = <Route path="*" component={MainApplicationPages} />;

  const initializeGA = () => {
    ReactGA.initialize("UA-148440710-1");
  };

  useEffect(() => {
    let doNotTrack = false;
    if (
      process.env.NODE_ENV === "test" ||
      window.doNotTrack === "1" ||
      navigator.doNotTrack === "yes" ||
      navigator.doNotTrack === "1"
    ) {
      // Do Not Track is enabled!
      doNotTrack = true;
    }
    !doNotTrack && initializeGA();
  }, []);

  return (
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <StylesProvider injectFirst>
          <SnackbarProvider>
            <BrowserRouter>
              <Switch>
                {loginRoute}
                {forgotPasswordRoute}
                {resetPasswordRoute}
                {signUpRoute}
                {verifyAccountRoute}
                {mainAppRoutes}
              </Switch>
            </BrowserRouter>
          </SnackbarProvider>
        </StylesProvider>
      </MuiThemeProvider>
    </Provider>
  );
};

export default App;
