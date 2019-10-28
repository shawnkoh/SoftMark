import React, { useEffect, useState } from "react";

import * as session from "../../modules/session";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api";
import { setCurrentToken } from "../../modules/session/actions";
import { Route, RouteComponentProps, withRouter } from "react-router";
import LoadingIcon from "../icons/LoadingIcon";

interface AuthenticationPagesProps {
  redirectComponent: React.FC<any> | React.ComponentClass<any>;
}

type Props = RouteComponentProps & AuthenticationPagesProps;

const AuthenticationPages: React.FC<Props> = props => {
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = useSelector(session.selectors.isLoggedIn);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoggedIn) {
      props.history.push("/papers");
    } else {
      api.auth
        .silentSignIn()
        .then(resp => {
          dispatch(setCurrentToken(resp.data));
          props.history.push("/papers");
        })
        .catch(error => {
          console.log("Not logged in.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [dispatch, props.history, isLoggedIn]);

  if (isLoading) {
    return <LoadingIcon />;
  }

  return (
    <Route
      exact
      path={props.location.pathname}
      component={props.redirectComponent}
    />
  );
};

export default withRouter(AuthenticationPages);
