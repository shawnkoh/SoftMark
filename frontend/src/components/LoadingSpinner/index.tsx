import React from "react";
import { Grid, CircularProgress, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

interface OwnProps {
  loadingMessage?: string;
}

type Props = OwnProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(8),
      marginBottom: theme.spacing(8)
    }
  })
);

const LoadingSpinner: React.FC<Props> = ({ loadingMessage = "" }) => {
  const classes = useStyles();
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      alignContent="center"
      spacing={4}
      className={classes.container}
    >
      <Grid item>
        <CircularProgress color="primary" />
      </Grid>
      <Grid item>
        <Typography variant="subtitle1" component="h2">
          {loadingMessage}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default LoadingSpinner;
