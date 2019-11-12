import {
  AppBar,
  Avatar,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import PagesIcon from "@material-ui/icons/Pages";
import api from "api";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import clsx from "clsx";
import LoadingSpinner from "components/LoadingSpinner";
import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import usePaper from "../../../contexts/PaperContext";
import ScriptTemplatePanel from "../ScriptTemplatePanel";
import useStyles from "./useStyles";

const ScriptTemplateView: React.FC = () => {
  const paper = usePaper();
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
