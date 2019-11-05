import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { toast } from "react-toastify";

import ResetPasswordPage from "../ResetPasswordPage";
import SignInPage from "../SignInPage";
import SignUpPage from "../SignUpPage";
import VerifyAccountPage from "../VerifyAccountPage";
import { getUser } from "../selectors";
import api from "../../../api";
import { setUser } from "../actions";
import { getRefreshToken } from "../../../localStorage";
import NotFoundPage from "../../NotFoundPage";

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
