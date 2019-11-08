import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import { Route, Switch } from "react-router-dom";
import NotFoundPage from "../main/NotFoundPage";
import PaperIndex from "../papers/PaperIndex";
import PaperView from "../papers/PaperView";
import PaperSetup from "../paperSetup/PaperSetup";
import ScriptView from "../scripts/ScriptView";
import theme from "./theme";

console.log(theme);

const AuthenticatedApp: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Switch>
        <Route exact path="/" component={PaperIndex} />
        <Route path="/papers/:paper_id/set_up" component={PaperSetup} />
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
