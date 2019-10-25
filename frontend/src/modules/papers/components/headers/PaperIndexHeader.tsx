import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { useSelector } from "react-redux";
import { Toolbar, AppBar, Typography, Grid, Button } from "@material-ui/core";
import { Person } from "@material-ui/icons";
import appLogo from "../../../../assets/logo.png";

type Props = RouteComponentProps;

const Header: React.FC<Props> = props => {
  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar>
        <Typography color="secondary" variant="h6">
          Papers
        </Typography>
        <Button
          color="secondary"
          onClick={() => props.history.push("/portfolio")}
        >
          <Person />
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default withRouter(Header);
