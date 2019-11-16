import { Grid } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import React from "react";
import { useHistory, useParams } from "react-router";
import softmarkLogo from "../../assets/softmark-logo.svg";
import LoadingSpinner from "../../components/LoadingSpinner";
import InviteForm from "./InviteForm";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(8),
      marginBottom: theme.spacing(8)
    }
  })
);

const InvitePage: React.FC = () => {
  const classes = useStyles();
  const { token } = useParams();
  const history = useHistory();

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
      id="session"
      spacing={4}
      className={classes.container}
    >
      <Grid item>
        <img src={softmarkLogo} alt={"Softmark Logo"} />
      </Grid>

      <Grid item>
        <InviteForm token={token} />
      </Grid>
    </Grid>
  );
};

export default InvitePage;
