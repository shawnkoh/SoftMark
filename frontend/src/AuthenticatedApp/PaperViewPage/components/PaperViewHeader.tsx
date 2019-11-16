import { AppBar, IconButton, Toolbar, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/EditOutlined";
import DeleteIcon from "@material-ui/icons/Delete";
import MenuIcon from "@material-ui/icons/Menu";
import React from "react";
import usePaper from "../../../contexts/PaperContext";
import DeletePaperModal from "./DeletePaperModal";
import EditPaperModal from "./EditPaperModal";
import { useHistory } from "react-router";

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

const PaperViewHeader: React.FC = () => {
  const classes = useStyles();
  const paper = usePaper();
  const { name } = paper;
  const history = useHistory();

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar>
        <IconButton
          onClick={() => history.push(`/`)}
          color="inherit"
          className={classes.papersButton}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.grow}>
          {name}
        </Typography>
        <EditPaperModal
          render={toggleModal => (
            <IconButton onClick={toggleModal} color="inherit">
              <EditIcon />
            </IconButton>
          )}
        />
        <DeletePaperModal
          paper={paper}
          render={toggleModal => (
            <IconButton onClick={toggleModal} color="inherit">
              <DeleteIcon />
            </IconButton>
          )}
        />
      </Toolbar>
    </AppBar>
  );
};

export default PaperViewHeader;
