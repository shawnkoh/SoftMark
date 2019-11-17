import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import { Route, Switch } from "react-router-dom";
import NotFoundPage from "../App/NotFoundPage";
import InvitePage from "../UnauthenticatedApp/InvitePage";
import PaperIndex from "./PaperIndexPage";
import PaperView from "./PaperViewPage";
import theme from "./theme";
import { PaperProvider } from "contexts/PaperContext";

const AuthenticatedApp: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Switch>
        <Route exact path="/" component={PaperIndex} />
        <Route exact path="/papers" component={PaperIndex} />
        <Route path="/papers/:paper_id">
          <PaperProvider>
            <PaperView />
          </PaperProvider>
        </Route>
        <Route exact path="/invite/:token" component={InvitePage} />
        <Route>
          <NotFoundPage isAuthenticated />
        </Route>
      </Switch>
    </ThemeProvider>
  );
};

export default AuthenticatedApp;
