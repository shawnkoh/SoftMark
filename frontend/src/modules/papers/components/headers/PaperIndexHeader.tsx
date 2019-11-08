import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import clsx from "clsx";

import { Container } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";

import SvgSoftmarkLogo from "../../../../components/svgr/SoftMarkLogo";
import AccountModal from "../../../auth/components/AccountModal";

type Props = RouteComponentProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1
    },
    toolbar: {
      paddingLeft: 0,
      paddingRight: 0
    },
    logo: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2)
    }
  })
);

const Header: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <AppBar position="sticky" color="inherit" elevation={1}>
      <Container fixed maxWidth="md">
        <Toolbar className={classes.toolbar}>
          <div className={clsx(classes.logo, classes.grow)}>
            <SvgSoftmarkLogo />
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

export default withRouter(Header);
