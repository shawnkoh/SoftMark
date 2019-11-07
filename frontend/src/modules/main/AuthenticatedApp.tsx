import React from "react";
import { Route, Switch } from "react-router-dom";

import PaperIndex from "../papers/pages/PaperIndex";
import PaperView from "../papers/pages/PaperView";
import ScriptView from "../scripts/pages/ScriptView";
import NotFoundPage from "../NotFoundPage";
import PaperSetup from "../paperSetup/pages/PaperSetup";

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
