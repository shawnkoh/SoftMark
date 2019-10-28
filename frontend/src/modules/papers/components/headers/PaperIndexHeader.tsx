import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { useSelector } from "react-redux";
import { Toolbar, AppBar, Typography, Grid, Button } from "@material-ui/core";
import { Person } from "@material-ui/icons";
import appLogo from "../../../../assets/logo.png";
import PortfolioButtonAndModal from "../../../session/components/misc/PortfolioButtonAndModal";

type Props = RouteComponentProps;

const Header: React.FC<Props> = props => {
  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar>
        <Typography color="secondary" variant="h6">
          Papers
        </Typography>
        <PortfolioButtonAndModal />
      </Toolbar>
    </AppBar>
  );
};

export default withRouter(Header);
