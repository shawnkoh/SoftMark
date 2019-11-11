import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Route, Switch } from "react-router-dom";

import api from "../../api";
import { PaperData } from "backend/src/types/papers";
import { PaperUserData } from "../../types/paperUsers";

import { makeStyles } from "@material-ui/core/styles";

import LoadingSpinner from "../../components/LoadingSpinner";
import ScriptMapping from "./ScriptMapping";
import ScriptTemplateView from "./ScriptTemplateView";

const useStyles = makeStyles(theme => ({}));

type Props = RouteComponentProps;

const PaperSetup: React.FC<Props> = ({ match: { params } }) => {
  const classes = useStyles();
  const paper_id = +(params as { paper_id: string }).paper_id;
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [
    currentPaperUser,
    setCurrentPaperUser
  ] = useState<PaperUserData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  const getPaper = async (paperId: number) => {
    const data = await api.papers.getPaper(paperId);
    if (!data) {
      return;
    }
    setCurrentPaperUser(data.currentPaperUser);
    setPaper(data.paper);
    setIsLoading(false);
  };

  useEffect(() => {
    getPaper(paper_id);
  }, [refreshFlag]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!paper || !currentPaperUser) {
    return <>The paper does not exist.</>;
  }

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

export default withRouter(PaperSetup);
