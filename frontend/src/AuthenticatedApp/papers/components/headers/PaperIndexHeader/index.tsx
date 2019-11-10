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
    toolbar: {
      paddingLeft: 0,
      paddingRight: 0
    },
    logoContainer: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2)
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
      <Container fixed>
        <Toolbar className={classes.toolbar}>
          <div className={clsx(classes.logoContainer, classes.grow)}>
            <img src={softmarkLogo} className={classes.logo} />
          </div>
          <AccountModal
            render={toggleModal => (
              <IconButton
                onClick={toggleModal}
                edge="end"
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
      </Container>
    </AppBar>
  );
};

export default PaperIndexHeader;
