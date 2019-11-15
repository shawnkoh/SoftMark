import { Grid, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { toast } from "react-toastify";
import api from "../../api";
import softmarkLogo from "../../assets/softmark-logo.svg";

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
  const history = useHistory();
  const { token } = useParams();
  const [name, setName] = useState<string | null>(null);

  const checkInvite = async () => {
    if (!token) {
      toast.error("No token provided");
      history.push("/");
      return;
    }

    try {
      const response = await api.paperUsers.checkInvite(token);
      // TODO: this api call should log them in too
      const { invite } = response.data;
      setName(invite.name);
    } catch (error) {
      toast.error("Expired invite");
      history.push("/");
    }
  };

  useEffect(() => {
    checkInvite();
  }, [token]);

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

      <Grid item>invite form</Grid>
    </Grid>
  );
};

export default InvitePage;
