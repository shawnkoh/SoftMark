import React from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { Grid, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import softmarkLogo from "../../../assets/softmark-logo.svg";
import ForgotPasswordForm from "./ForgotPasswordForm";

type Props = RouteComponentProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(8),
      marginBottom: theme.spacing(8)
    }
  })
);

const ForgotPasswordPage: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      alignContent="center"
      id="session"
      spacing={4}
      className={classes.container}
    >
      <Grid item>
        <img src={softmarkLogo} />
      </Grid>
      <Grid item>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
      </Grid>
      <Grid item>
        <ForgotPasswordForm />
      </Grid>
    </Grid>
  );
};

export default withRouter(ForgotPasswordPage);
