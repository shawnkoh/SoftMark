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
import {
  ScriptTemplateData,
  ScriptTemplateSetupData
} from "backend/src/types/scriptTemplates";
import clsx from "clsx";
import LoadingSpinner from "components/LoadingSpinner";
import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import usePaper from "../../../contexts/PaperContext";
import ScriptTemplatePanel from "../ScriptTemplatePanel";
import useStyles from "./useStyles";
import QuestionTemplateTree from "./QuestionTemplateTree";
import "./styles.css";
const ScriptTemplateView: React.FC = () => {
  const paper = usePaper();
  const classes = useStyles();

  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);
  const [
    scriptTemplateSetup,
    setScriptTemplateSetup
  ] = useState<ScriptTemplateSetupData | null>(null);

  useEffect(() => {
    api.scriptTemplates.getScriptTemplate(paper.id).then(resp => {
      if (resp) {
        setScriptTemplate(resp);
        api.scriptTemplates.getScriptTemplateSetupData(resp.id).then(resp => {
          if (resp) {
            setScriptTemplateSetup(resp.data);
          }
        });
      }
    });
  }, []);

  if (!scriptTemplate || !scriptTemplateSetup) {
    return <LoadingSpinner />;
  }

  const nextPage = () =>
    currentPageNo < scriptTemplateSetup.pageTemplates.length &&
    setCurrentPageNo(currentPageNo + 1);

  const prevPage = () =>
    currentPageNo > 1 && setCurrentPageNo(currentPageNo - 1);

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Script Template Setup
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={classes.drawer}
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <div className={classes.toolbar} />
        <List component="nav">
          {scriptTemplateSetup.questionTemplates.map(questionTemplate => (
            <QuestionTemplateTree
              key={questionTemplate.id}
              questionTemplateTree={questionTemplate}
              depth={0}
              leafOnClick={(displayPageNo: number) =>
                setCurrentPageNo(displayPageNo)
              }
            />
          ))}
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <DndProvider backend={HTML5Backend}>
          {scriptTemplate.pageTemplates.map(pageTemplate => (
            <ScriptTemplatePanel
              key={pageTemplate.id}
              questionTemplateTrees={scriptTemplateSetup.questionTemplates}
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
