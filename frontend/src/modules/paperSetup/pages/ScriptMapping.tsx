import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../../api";
import { PaperData } from "backend/src/types/papers";
import { ScriptPaperUserListData } from "backend/src/types/scriptPaperUsers";
import { Annotation } from "backend/src/types/annotations";
import { CanvasMode } from "../../../types/canvas";

import Canvas from "../../scripts/components/annotator/Canvas";
import TogglePageComponent from "../../scripts/components/misc/TogglePageComponent";
import Header from "../components/headers/PaperSetupHeader";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";

interface OwnProps {
  paper: PaperData;
}

type Props = OwnProps & RouteComponentProps;

const ScriptTemplateView: React.FC<Props> = ({ paper, match: { params } }) => {
  const paper_id = +(params as { paper_id: string }).paper_id;
  const [scriptPaperUsers, setScriptPaperUsers] = useState<
    ScriptPaperUserListData[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <>
        <LoadingSpinner />
        Loading script template...
      </>
    );
  }

  return (
    <>
      <Header paper={paper} title="Mapping of scripts to nominal roll" />
      SciptMapping table
    </>
  );
};

export default withRouter(ScriptTemplateView);
