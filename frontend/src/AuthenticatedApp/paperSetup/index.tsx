import React from "react";
import { Route, Switch } from "react-router-dom";
import { PaperProvider } from "../../contexts/PaperContext";
import ScriptMapping from "./ScriptMapping";
import ScriptSetup from "./ScriptSetup";
import QuestionAllocation from "../QuestionAllocationPage";

const PaperSetup: React.FC = () => {
  const BASE_URL = "/papers/:paper_id/set_up";

  // Sub routes
  const scriptSetupRoute = (
    <Route exact path={`${BASE_URL}/script_template`}>
      <ScriptSetup />
    </Route>
  );
  const scriptMappingRoute = (
    <Route exact path={`${BASE_URL}/script_mapping`}>
      <ScriptMapping />
    </Route>
  );
  const questionAllocationRoute = (
    <Route exact path={`${BASE_URL}/question_allocation`}>
      <QuestionAllocation />
    </Route>
  );

  return (
    <>
      <PaperProvider>
        <Switch>
          {scriptSetupRoute}
          {scriptMappingRoute}
          {questionAllocationRoute}
        </Switch>
      </PaperProvider>
    </>
  );
};

export default PaperSetup;
