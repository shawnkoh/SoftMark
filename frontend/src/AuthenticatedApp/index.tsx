import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import { PaperProvider } from "contexts/PaperContext";
import React from "react";
import { Route, Switch } from "react-router-dom";
import NotFoundPage from "../App/NotFoundPage";
import InvitePage from "../UnauthenticatedApp/InvitePage";
import PaperIndex from "./PaperIndexPage";
import PaperView from "./PaperViewPage";
import theme from "./theme";

const AuthenticatedApp: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Switch>
        <Route exact path="/">
          <PaperIndex />
        </Route>
        <Route exact path="/papers">
          <PaperIndex />
        </Route>
        <Route path="/papers/:paper_id">
          <PaperProvider>
            <PaperView />
          </PaperProvider>
        </Route>
        <Route exact path="/invite/:token">
          <InvitePage />
        </Route>
        <Route>
          <NotFoundPage isAuthenticated />
        </Route>
      </Switch>
    </ThemeProvider>
  );
};

export default AuthenticatedApp;
