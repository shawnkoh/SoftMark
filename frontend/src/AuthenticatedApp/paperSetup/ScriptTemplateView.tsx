import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import clsx from "clsx";
import api from "api";
// Material UI
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Drawer,
  IconButton,
  ListItemIcon,
  Avatar,
  AppBar,
  Toolbar,
  Typography
} from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import PagesIcon from "@material-ui/icons/Pages";
// Types
import { PaperData } from "backend/src/types/papers";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
// Components
import ScriptTemplatePanel from "./ScriptTemplatePanel";
import LoadingSpinner from "components/LoadingSpinner";

const drawerWidth = 175;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    height: "100%"
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    minHeight: "100vh",
    maxHeight: "100vh"
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 36
  },
  hide: {
    display: "none"
  },
  toolbar: theme.mixins.toolbar,
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap"
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1
    }
  },
  avatar: {
    color: "#fff",
    backgroundColor: theme.palette.primary.light
  },
  avatarSelected: {
    color: "#fff",
    backgroundColor: theme.palette.primary.dark
  }
}));

interface ScriptTemplateViewProps {
  paper: PaperData;
}

const ScriptTemplateView: React.FC<ScriptTemplateViewProps> = props => {
  const { paper } = props;

  const classes = useStyles();
  const theme = useTheme();

  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);

  useEffect(() => {
    api.scriptTemplates.getScriptTemplate(paper.id).then(resp => {
      if (resp) {
        setScriptTemplate(resp);
      }
    });
  }, []);

  if (!scriptTemplate) {
    return <LoadingSpinner />;
  }

  const handleChangePage = (newPage: number) => (event: any) => {
    setCurrentPageNo(newPage);
  };

  const nextPage = () =>
    currentPageNo < scriptTemplate.pageTemplates.length &&
    setCurrentPageNo(currentPageNo + 1);

  const prevPage = () =>
    currentPageNo > 1 && setCurrentPageNo(currentPageNo - 1);

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: drawerOpen
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: drawerOpen
            })}
          >
            <PagesIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Mini variant drawer
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: drawerOpen,
          [classes.drawerClose]: !drawerOpen
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: drawerOpen,
            [classes.drawerClose]: !drawerOpen
          })
        }}
        open={drawerOpen}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={() => setDrawerOpen(false)}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </div>
        <Divider />
        <List>
          {scriptTemplate.pageTemplates.map(pageTemplate => (
            <ListItem
              button
              key={pageTemplate.id}
              onClick={handleChangePage(pageTemplate.pageNo)}
            >
              <ListItemIcon>
                <Avatar
                  className={clsx({
                    [classes.avatar]: pageTemplate.pageNo != currentPageNo,
                    [classes.avatarSelected]:
                      pageTemplate.pageNo == currentPageNo
                  })}
                  variant="rounded"
                >
                  {pageTemplate.pageNo}
                </Avatar>
              </ListItemIcon>
              <ListItemText primary={`Page ${pageTemplate.pageNo}`} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <DndProvider backend={HTML5Backend}>
          {scriptTemplate.pageTemplates.map(pageTemplate => (
            <ScriptTemplatePanel
              key={pageTemplate.id}
              questionTemplates={scriptTemplate.questionTemplates}
              currentPageNo={currentPageNo}
              pageCount={scriptTemplate.pageTemplates.length}
              nextPage={nextPage}
              prevPage={prevPage}
              pageTemplate={pageTemplate}
            />
          ))}
        </DndProvider>
      </main>
    </div>
  );
};

export default ScriptTemplateView;
