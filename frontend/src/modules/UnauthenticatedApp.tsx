import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { toast } from "react-toastify";

import api from "api";
import { getRefreshToken } from "localStorage";
import { getUser } from "./auth/selectors";
import { setUser } from "./auth/actions";

import SignInPage from "./auth/SignInPage";
import SignUpPage from "./auth/SignUpPage";
import VerifyAccountPage from "./auth/VerifyAccountPage";
import ResetPasswordPage from "./auth/ResetPasswordPage";
import NotFoundPage from "./main/NotFoundPage";

const UnauthenticatedApp: React.FC = props => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();

  const tokenLogin = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return;
    }
    const loggedIn = await api.auth.tokenLogin(refreshToken);
    if (!loggedIn) {
      toast.error("Incorrect username or password");
      return;
    }
    const user = await api.users.getOwnUser();
    if (!user) {
      toast.error("Something went wrong");
      return;
    }
    dispatch(setUser(user));
  };

  useEffect(() => {
    if (user) {
      return;
    }
    tokenLogin();
  }, [user]);

  return (
    <Switch>
      <Route exact path="/" component={SignInPage} />
      <Route exact path="/login" component={SignInPage} />
      <Route exact path="/signup" component={SignUpPage} />
      <Route
        exact
        path="/auth/password_reset/:token"
        component={ResetPasswordPage}
      />
      <Route
        exact
        path="/auth/email_verification/:token"
        component={VerifyAccountPage}
      />
      <Route component={NotFoundPage} />
    </Switch>
  );
};

export default UnauthenticatedApp;
