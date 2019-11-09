import React from "react";

import { Grid, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import softmarkLogo from "../../assets/softmark-logo.svg";
import SignUpForm from "./SignUpForm";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      flexGrow: 1,
      marginTop: theme.spacing(8),
      marginBottom: theme.spacing(8)
    }
  })
);

const SignUpPage: React.FC = () => {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      alignContent="center"
      id="signUp"
      spacing={4}
      className={classes.container}
    >
      <Grid item>
        <img src={softmarkLogo} />
      </Grid>
      <Grid item>
        <Typography component="h1" variant="h5">
          Create your account
        </Typography>
      </Grid>
      <Grid item>
        <SignUpForm />
      </Grid>
    </Grid>
  );
};

export default SignUpPage;
