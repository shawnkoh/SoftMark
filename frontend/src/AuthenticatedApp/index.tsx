import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import { Route, Switch } from "react-router-dom";
import NotFoundPage from "../App/NotFoundPage";
import PaperIndex from "./PaperIndexPage";
import PaperView from "./PaperViewPage";
import PaperSetup from "./paperSetup";
import ScriptView from "./scripts/ScriptView";
import theme from "./theme";

const AuthenticatedApp: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Switch>
        <Route exact path="/" component={PaperIndex} />
        <Route path="/papers/:paper_id/setup" component={PaperSetup} />
        <Route path="/papers/:paper_id" component={PaperView} />
        <Route path="/scripts/:script_id" component={ScriptView} />
        <Route>
          <NotFoundPage isAuthenticated />
        </Route>
      </Switch>
    </ThemeProvider>
  );
};

export default AuthenticatedApp;
