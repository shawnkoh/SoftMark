import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { useSelector } from "react-redux";
import { Toolbar, AppBar, Typography, IconButton } from "@material-ui/core";
import { ArrowBackIos } from "@material-ui/icons";

type Props = RouteComponentProps;
const Header: React.FC<Props> = props => {
  const toShowBackButton = (): boolean => {
    return !["/settings", "/profile"].includes(props.location.pathname);
  };

  const goBack = (): void => {
    props.history.goBack();
  };

  return (
    <AppBar position="fixed" color="primary" elevation={1}>
      <Toolbar>
        <Typography variant="h6">put some header here</Typography>

        {toShowBackButton() && (
          <IconButton edge="start" color="inherit" onClick={goBack}>
            <ArrowBackIos />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default withRouter(Header);
