import {
  AppBar,
  Grid,
  IconButton,
  Toolbar,
  Typography
} from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import React from "react";
import { Link } from "react-router-dom";
import usePaper from "../../../../contexts/PaperContext";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1
    },
    grow: {
      flexGrow: 1
    },
    backButton: {
      marginRight: theme.spacing(2)
    }
  })
);

interface Props {
  title: string;
}

const Header: React.FC<Props> = props => {
  const paper = usePaper();
  const classes = useStyles();
  const { title } = props;
  const { name } = paper;

  return (
    <AppBar color="primary" elevation={1} className={classes.appBar}>
      <Toolbar>
        <IconButton
          component={Link}
          to={`/papers/${paper.id}/setup`}
          color="inherit"
          className={classes.backButton}
        >
          <ArrowBackIcon />
        </IconButton>
        <Grid container className={classes.grow}>
          <Grid item xs={12}>
            <Typography variant="h6" color="inherit">
              {name}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="inherit">
              {title}
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
