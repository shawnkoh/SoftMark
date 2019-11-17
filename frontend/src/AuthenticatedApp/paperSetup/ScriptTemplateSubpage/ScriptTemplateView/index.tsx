import { AppBar, Drawer, List, Toolbar, Typography } from "@material-ui/core";
import React from "react";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import ScriptTemplatePanel from "../PageTemplateView";
import useStyles from "./useStyles";
import QuestionTemplateTree from "./QuestionTemplateTree";
import useScriptSetup from "../../context/ScriptSetupContext";

const ScriptTemplateView: React.FC = () => {
  const classes = useStyles();
  const { scriptTemplateSetupData, goPage } = useScriptSetup();
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
          {scriptTemplateSetupData.questionTemplates.map(questionTemplate => (
            <QuestionTemplateTree
              key={questionTemplate.id}
              questionTemplateTree={questionTemplate}
              depth={0}
              leafOnClick={(displayPageNo: number) => goPage(displayPageNo)}
            />
          ))}
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <DndProvider backend={HTML5Backend}>
          {scriptTemplateSetupData.pageTemplates.map(pageTemplate => (
            <ScriptTemplatePanel
              key={pageTemplate.id}
              pageTemplate={pageTemplate}
            />
          ))}
        </DndProvider>
      </main>
    </div>
  );
};

export default ScriptTemplateView;
