import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { AppBar, Container, Toolbar,  Typography } from "@material-ui/core";
import { PaperData } from "backend/src/types/papers";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      flexGrow: 1
    },
    toolbar: {
      paddingLeft: 0,
      paddingRight: 0
    }
  })
);

interface OwnProps {
  paper: PaperData;
  title: string;
  changesSaved?: boolean;
}

type Props = RouteComponentProps & OwnProps;

const Header: React.FC<Props> = props => {
  const classes = useStyles();
  const { paper, title, changesSaved = true } = props;
  const { name } = paper;

  console.log(title);

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Container fixed maxWidth="md">
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" className={classes.title}>
            {name}
          </Typography>
          <Typography variant="subtitle1">
            {title}
          </Typography>
          <Typography variant="subtitle1">
            {changesSaved ? "Changes saved." : "Saving changes..."}
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default withRouter(Header);
