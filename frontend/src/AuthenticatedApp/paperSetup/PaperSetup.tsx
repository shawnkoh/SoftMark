import React from "react";
import { Route, Switch } from "react-router-dom";
import ScriptMapping from "./ScriptMapping";
import ScriptTemplateView from "./ScriptTemplateView";

const PaperSetup: React.FC = () => {
  const BASE_URL = "/papers/:paper_id/set_up";

  // Sub routes
  const scriptTemplateViewRoute = (
    <Route exact path={`${BASE_URL}/script_template`}>
      <ScriptTemplateView />
    </Route>
  );
  const scriptMappingRoute = (
    <Route exact path={`${BASE_URL}/script_mapping`}>
      <ScriptMapping />
    </Route>
  );

  return (
    <>
      <Switch>
        {scriptTemplateViewRoute}
        {scriptMappingRoute}
      </Switch>
    </>
  );
};

export default PaperSetup;
