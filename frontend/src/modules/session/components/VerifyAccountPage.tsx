import React, { useEffect } from "react";
import { RouteComponentProps } from "react-router";
import ReactGA from "react-ga";
import api from "../../../api";

import useSnackbar from "../../../components/snackbar/useSnackbar";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";

const queryString = require("query-string");

type RouteSearchParam = {
  code: string;
  email: string;
};

type Props = RouteComponentProps;
const VerifyAccountPage: React.FC<Props> = props => {
  const params: RouteSearchParam = queryString.parse(props.location.search);
  const snackbar = useSnackbar();

  useEffect(() => {
    api.users
      .verifyAccount(params.email, params.code)
      .then(resp => {
        ReactGA.event({
          category: "User",
          action: "Account is successfully created and verified"
        });
        snackbar.showMessage("You account has been activated!", "Close");
      })
      .catch(error => {
        snackbar.showMessage("Invalid account verification.", "Close");
      })
      .finally(() => {
        props.history.push("/login");
      });
  }, [props.history, params, snackbar]);

  return <LoadingSpinner />;
};

export default VerifyAccountPage;
