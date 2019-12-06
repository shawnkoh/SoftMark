import {
  AppBar,
  Grid,
  IconButton,
  Toolbar,
  Typography
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import React from "react";
import { Link } from "react-router-dom";
import usePaper from "../../../contexts/PaperContext";
import useStyles from "./styles";

interface Props {
  subtitle: string;
}

const Header: React.FC<Props> = ({ subtitle }) => {
  const classes = useStyles();
  const paper = usePaper();

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <IconButton
          color="inherit"
          component={Link}
          to={`/papers/${paper.id}/scripts`}
          className={classes.backButton}
        >
          <ArrowBackIcon />
        </IconButton>
        <Grid container className={classes.grow}>
          <Grid item xs={12}>
            <Typography variant="h6">{paper.name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">{subtitle}</Typography>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
