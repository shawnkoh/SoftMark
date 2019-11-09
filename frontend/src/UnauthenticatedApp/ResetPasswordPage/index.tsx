import React from "react";
import { useHistory, useParams } from "react-router";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";

import softmarkLogo from "../../assets/softmark-logo.svg";
import LoadingSpinner from "../../components/LoadingSpinner";
import ResetPasswordForm from "./ResetPasswordForm";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(8),
      marginBottom: theme.spacing(8)
    }
  })
);

const ResetPasswordPage: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { token } = useParams();

  if (!token) {
    history.push("/");
    return <LoadingSpinner />;
  }

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
        <ResetPasswordForm token={token} />
      </Grid>
    </Grid>
  );
};

export default ResetPasswordPage;
