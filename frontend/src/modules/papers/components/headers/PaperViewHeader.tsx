import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Toolbar, AppBar, Typography } from "@material-ui/core";
import { PaperData } from "backend/src/types/papers";
import { drawerWidth } from "../sidebars/Sidebar";

const useStyles = makeStyles(theme => ({
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth
  }
}));

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
    <AppBar position="fixed" color="secondary" className={classes.appBar}>
      <Toolbar>
        <Typography color="primary" variant="h5">
          {name}
        </Typography>
        <br />
        <Typography color="primary" variant="h6">
          Things to do stub
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default withRouter(Header);
