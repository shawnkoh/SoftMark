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
import Edit from "@material-ui/icons/EditOutlined";
import EditPaperModal from "../modals/EditPaperModal";
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
  refreshPaper: () => void;
}

type Props = RouteComponentProps & OwnProps;

const PaperViewHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const { paper, title, refreshPaper } = props;
  const { name } = paper;

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Container fixed maxWidth="md">
        <Toolbar className={classes.toolbar}>
          <IconButton onClick={() => props.history.push(`/`)}>
            <ArrowLeftSharp />
          </IconButton>
          <Typography variant="h4" className={classes.title}>
            PAPER: {name.toUpperCase()}
          </Typography>
          <EditPaperModal
            paper={paper}
            refreshPaper={refreshPaper}
            render={toggleModal => (
              <IconButton onClick={toggleModal}>
                <Edit />
              </IconButton>
            )}
          />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default withRouter(PaperViewHeader);
