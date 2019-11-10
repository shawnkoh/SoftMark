import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { PaperData } from "backend/src/types/papers";
import api from "../../api";

import { makeStyles, useTheme } from "@material-ui/core/styles";

import LoadingSpinner from "../../components/LoadingSpinner";
import {
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Hidden
} from "@material-ui/core";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import QuestionContainer from "./components/QuestionContainer";

import MenuIcon from "@material-ui/icons/Menu";
import GoBackIcon from "@material-ui/icons/ArrowBackIos";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";

import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  drawerPaper: {
    width: drawerWidth
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    minHeight: "100vh",
    maxHeight: "100vh"
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none"
    }
  },
  addFab: {
    position: "absolute",
    right: theme.spacing(2),
    bottom: theme.spacing(2)
  }
}));

type Props = RouteComponentProps;

const QuestionAllocation: React.FC<Props> = ({
  match: { params },
  history
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [viewPageNo, setViewPage] = React.useState(1);

  const paper_id = +(params as { paper_id: string }).paper_id;
  const [isLoadingPaper, setIsLoadingPaper] = useState(true);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);

  useEffect(() => {
    api.papers
      .getPaper(paper_id)
      .then(resp => {
        resp && setPaper(resp.paper);
      })
      .finally(() => setIsLoadingPaper(false));
    api.scriptTemplates
      .getScriptTemplate(paper_id)
      .then(resp => {
        resp && setScriptTemplate(resp);
      })
      .finally(() => setIsLoadingTemplate(false));
  }, [paper_id]);

  if (isLoadingPaper || isLoadingTemplate) {
    return <LoadingSpinner />;
  }

  if (!scriptTemplate) {
    return <>The script does not exist</>;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <>
      <div className={classes.toolbar} />
      <Divider />
      <List>
        {scriptTemplate.questionTemplates.map((questionTemplate, index) => (
          <ListItem button key={index}>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={questionTemplate.name} />
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => history.goBack()}
          >
            <GoBackIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {paper && paper.name}
          </Typography>
        </Toolbar>
      </AppBar>
      <nav>
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            className={classes.drawer}
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper
            }}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            className={classes.drawer}
            classes={{
              paper: classes.drawerPaper
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <DndProvider backend={HTML5Backend}>
          <QuestionContainer
            scriptTemplate={scriptTemplate}
            viewPageNo={viewPageNo}
            setViewPage={setViewPage}
          />
        </DndProvider>
      </main>
    </div>
  );
};

export default withRouter(QuestionAllocation);
