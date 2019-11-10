import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import {
  AppBar,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Typography
} from "@material-ui/core";
import { PaperData } from "backend/src/types/papers";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1
    },
    backButton: {
      marginRight: theme.spacing(2)
    }
  })
);

interface OwnProps {
  paper: PaperData;
  title: string;
}

type Props = RouteComponentProps & OwnProps;

const Header: React.FC<Props> = props => {
  const classes = useStyles();
  const { paper, title } = props;
  const { name } = paper;

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar>
        <IconButton
          onClick={() => props.history.push(`/papers/${paper.id}/setup`)}
          color="inherit"
          className={classes.backButton}
        >
          <ArrowBackIcon />
        </IconButton>
        <Grid container className={classes.grow}>
          <Grid item xs={12}>
            <Typography variant="h6">{name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">{title}</Typography>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default withRouter(Header);
