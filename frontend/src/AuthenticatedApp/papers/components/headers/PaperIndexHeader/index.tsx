import { Container } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import AccountCircle from "@material-ui/icons/AccountCircle";
import clsx from "clsx";
import React from "react";
import softmarkLogo from "../../../../../assets/softmark-logo.svg";
import AccountModal from "./AccountModal";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1
    },
    logoContainer: {
      padding: theme.spacing(1)
    },
    logo: {
      height: 24
    }
  })
);

const PaperIndexHeader: React.FC = () => {
  const classes = useStyles();

  return (
    <AppBar position="sticky" color="inherit" elevation={1}>
      <Toolbar>
        <div className={clsx(classes.logoContainer, classes.grow)}>
          <img src={softmarkLogo} className={classes.logo} />
        </div>
        <AccountModal
          render={toggleModal => (
            <IconButton
              onClick={toggleModal}
              aria-label="Account of current user"
              aria-haspopup="true"
              color="primary"
              size="medium"
            >
              <AccountCircle />
            </IconButton>
          )}
        />
      </Toolbar>
    </AppBar>
  );
};

export default PaperIndexHeader;
