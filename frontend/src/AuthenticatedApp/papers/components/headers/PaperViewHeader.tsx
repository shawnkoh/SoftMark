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
import EditIcon from "@material-ui/icons/EditOutlined";
import MenuIcon from "@material-ui/icons/Menu";
import EditPaperModal from "../modals/EditPaperModal";
import { PaperData } from "backend/src/types/papers";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1
    },
    toolbar: {
      paddingLeft: 0,
      paddingRight: 0
    },
    papersButton: {
      marginRight: theme.spacing(2)
    }
  })
);

interface OwnProps {
  paper: PaperData;
  refreshPaper: () => void;
}

type Props = RouteComponentProps & OwnProps;

const PaperViewHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const { paper, refreshPaper } = props;
  const { name } = paper;

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Container fixed>
        <Toolbar className={classes.toolbar}>
          <IconButton
            onClick={() => props.history.push(`/`)}
            color="inherit"
            className={classes.papersButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" className={classes.grow}>
            {name}
          </Typography>
          <EditPaperModal
            paper={paper}
            refreshPaper={refreshPaper}
            render={toggleModal => (
              <IconButton onClick={toggleModal} color="inherit">
                <EditIcon />
              </IconButton>
            )}
          />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default withRouter(PaperViewHeader);
