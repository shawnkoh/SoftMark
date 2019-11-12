import React from "react";
import { Route, Switch } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import ScriptMapping from "./ScriptMapping";
import ScriptTemplateView from "./ScriptTemplateView";

const PaperSetupRouter: React.FC<RouteComponentProps> = ({ match }) => {
  return (
    <Switch>
      <Route
        exact
        path={`${match.path}/script_template`}
        component={ScriptTemplateView}
      />
      <Route
        exact
        path={`${match.path}/script_mapping`}
        component={ScriptMapping}
      />
    </Switch>
  );
};

export default PaperSetupRouter;
