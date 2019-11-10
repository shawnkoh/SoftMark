import React from "react";
import { RouteComponentProps } from "react-router";

import { Grid, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import softmarkLogo from "../../assets/softmark-logo.svg";
import SignInForm from "./SignInForm";

type Props = RouteComponentProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(8),
      marginBottom: theme.spacing(8)
    }
  })
);

const SignInPage: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      id="session"
      spacing={4}
      className={classes.container}
    >
      <Grid item>
        <img src={softmarkLogo} />
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
