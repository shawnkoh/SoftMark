import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import { Route, Switch } from "react-router-dom";
import NotFoundPage from "../App/NotFoundPage";
import PaperIndex from "./PaperIndexPage";
import PaperView from "./PaperViewPage";
import ScriptView from "./paperScripts/ScriptView";
import theme from "./theme";

import { CanvasWithToolbar } from "../components/Canvas";

const AuthenticatedApp: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Switch>
        <Route exact path="/" component={PaperIndex} />
        <Route exact path="/papers" component={PaperIndex} />
        <Route path="/papers/:paper_id" component={PaperView} />
        <Route path="/scripts/:script_id" component={ScriptView} />
        <Route path="/canvas">
          <div
            style={{ minHeight: "100vh", minWidth: "100vw", display: "flex" }}
          >
            <CanvasWithToolbar
              drawable
              foregroundAnnotation={[]}
              backgroundImageSource="https://sscportal.in/sites/default/files/SSC-CGL-Tier-1-Exam-Paper-9-8-2015-morning%20(1).jpeg"
            />
          </div>
        </Route>
        <Route>
          <NotFoundPage isAuthenticated />
        </Route>
      </Switch>
    </ThemeProvider>
  );
};

export default AuthenticatedApp;
