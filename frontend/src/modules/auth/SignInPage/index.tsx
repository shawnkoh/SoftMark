import React from "react";
import { RouteComponentProps } from "react-router";
import { Grid, Typography } from "@material-ui/core";

import SvgSoftmarkLogo from "components/svgr/SoftMarkLogo";
import SignInForm from "./SignInForm";

type Props = RouteComponentProps;

const SignInPage: React.FC<Props> = props => {
  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      id="session"
    >
      <Grid item>
        <SvgSoftmarkLogo />
      </Grid>

      <Grid item>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
      </Grid>

      <Grid item>
        <SignInForm />
      </Grid>
    </Grid>
  );
};

export default SignInPage;
