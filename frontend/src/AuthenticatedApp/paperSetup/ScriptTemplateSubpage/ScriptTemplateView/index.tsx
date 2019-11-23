import { Drawer, List } from "@material-ui/core";
import React from "react";
import { DndProvider } from "react-dnd";
import MultiBackend from "react-dnd-multi-backend";
import HTML5toTouch from "react-dnd-multi-backend/dist/esm/HTML5toTouch";
import useScriptSetup from "../../context/ScriptSetupContext";
import PageTemplateView from "../PageTemplateView";
import Header from "./PaperSetupHeaderStatic";
import QuestionTemplateTree from "./QuestionTemplateTree";
import useStyles from "./useStyles";

const ScriptTemplateView: React.FC = () => {
  const classes = useStyles();
  const { scriptTemplateSetupData, goPage } = useScriptSetup();

  return (
    <div className={classes.root}>
      <Header title="Set up question structure" />
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
        <DndProvider backend={MultiBackend} options={HTML5toTouch}>
          {scriptTemplateSetupData.pageTemplates.map(pageTemplate => (
            <PageTemplateView
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
