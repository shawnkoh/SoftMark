import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Document, Page } from "react-pdf";
import { getDocument } from "pdfjs-dist";
import { AppState } from "../../../../types/store";
import api from "../../../../api";
import LoadingIcon from "../../../../components/icons/LoadingIcon";
//import Header from "../headers/PaperViewHeader";
import { PaperData } from "backend/src/types/papers";
import { ScriptData, ScriptListData } from "backend/src/types/scripts";

type Props = RouteComponentProps;

const ScriptView: React.FC<Props> = ({ match: { params } }) => {
  const script_id = +(params as { script_id: string }).script_id;
  const [script, setScript] = useState<ScriptData | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  //const [file, setFile] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  useEffect(() => {
    api.scripts
      .getScript(script_id)
      .then(resp => {
        setScript(resp.data);
      })
      .finally(() => setIsLoading(false));
  }, [refreshFlag]);

  if (isLoading) {
    return <LoadingIcon />;
  }

  if (!script) {
    return <>The script does not exist</>;
  }

  return (
    <div>
      {script.imageUrls.map((imageUrl, index) => {
        return <img key={index} src={imageUrl} />;
      })}
    </div>
  );
};

export default withRouter(ScriptView);
