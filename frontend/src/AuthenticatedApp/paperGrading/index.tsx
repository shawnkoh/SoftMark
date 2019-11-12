import React from "react";
import { Route, Switch } from "react-router-dom";
import { RouteComponentProps } from "react-router";

import usePaper from "../../contexts/PaperContext";
import MarkQuestionPage from "./MarkQuestionPage";

const PaperGrading: React.FC<RouteComponentProps> = ({ match }) => {
  const paper = usePaper();

  return (
    <Switch>
      <Route exact path={`${match.path}/mark/:questionId`}>
        <MarkQuestionPage />
      </Route>
    </Switch>
  );
};

export default PaperGrading;
