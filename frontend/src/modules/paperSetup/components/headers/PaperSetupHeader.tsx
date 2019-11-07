import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import {
  AppBar,
  Container,
  IconButton,
  Toolbar,
  Typography
} from "@material-ui/core";
import { PaperData } from "backend/src/types/papers";
import ArrowLeftSharp from "@material-ui/icons/ArrowLeftSharp";

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
}

type Props = RouteComponentProps & OwnProps;

const Header: React.FC<Props> = props => {
  const classes = useStyles();
  const { paper, title } = props;
  const { name } = paper;

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Container fixed maxWidth="md">
        <Toolbar className={classes.toolbar}>
          <IconButton
            onClick={() => props.history.push(`/papers/${paper.id}/setup`)}
          >
            <ArrowLeftSharp />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {name}
          </Typography>
          <Typography variant="subtitle1">{title}</Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default withRouter(Header);
