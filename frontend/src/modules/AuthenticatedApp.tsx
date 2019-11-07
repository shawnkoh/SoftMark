import React from "react";
import { Route, Switch } from "react-router-dom";

import PaperIndex from "./papers/PaperIndex";
import PaperView from "./papers/PaperView";
import ScriptView from "./scripts/ScriptView";
import NotFoundPage from "./main/NotFoundPage";
import PaperSetup from "./paperSetup/PaperSetup";

const AuthenticatedApp: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={PaperIndex} />
      <Route path="/papers/:paper_id/set_up" component={PaperSetup} />
      <Route path="/papers/:paper_id" component={PaperView} />
      <Route path="/scripts/:script_id" component={ScriptView} />
      <Route>
        <NotFoundPage isAuthenticated />
      </Route>
    </Switch>
  );
};

export default AuthenticatedApp;
