import React from "react";
import { Route, Switch } from "react-router-dom";
import usePaper from "../../contexts/PaperContext";
import ScriptMapping from "./ScriptMapping";
import ScriptTemplateView from "./ScriptTemplateView";

const PaperSetup: React.FC = () => {
  const paper = usePaper();

  const BASE_URL = "/papers/:paper_id/set_up";

  // Sub routes
  const scriptTemplateViewRoute = (
    <Route exact path={`${BASE_URL}/script_template`}>
      <ScriptTemplateView paper={paper} />
    </Route>
  );
  const scriptMappingRoute = (
    <Route exact path={`${BASE_URL}/script_mapping`}>
      <ScriptMapping paper={paper} />
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
