import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";

import AccountModal from "../../../session/components/misc/AccountModal";
import appLogo from "../../../../assets/logo.png";

type Props = RouteComponentProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      flexGrow: 1
    }
  })
);

const Header: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          Papers
        </Typography>
        <AccountModal>
          {toggleModal => (
            <IconButton
              onClick={toggleModal}
              edge="end"
              aria-label="Account of current user"
              aria-haspopup="true"
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          )}
        </AccountModal>
      </Toolbar>
    </AppBar>
  );
};

export default withRouter(Header);
