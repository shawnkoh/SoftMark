import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Document, Page } from "react-pdf";
import { getDocument } from "pdfjs-dist";
import { AppState } from "../../../../types/store";
import api from "../../../../api";
import LoadingIcon from "../../../../components/icons/LoadingIcon";
import { PaperData } from "backend/src/types/papers";
import { ScriptData, ScriptListData } from "backend/src/types/scripts";
import Annotater from "../annotater/Annotater";
import TogglePageComponent from "../misc/TogglePageComponent";

type Props = RouteComponentProps;

const ScriptView: React.FC<Props> = ({ match: { params } }) => {
  const script_id = +(params as { script_id: string }).script_id;
  const [script, setScript] = useState<ScriptData | null>(null);

  const [viewPageNo, setViewPageNo] = useState(1);
  const incrementViewPageNo = () => setViewPageNo(viewPageNo + 1);
  const decrementViewPageNo = () => setViewPageNo(viewPageNo - 1);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  useEffect(() => {
    api.scripts
      .getScript(script_id)
      .then(resp => {
        setScript(resp.data.script);
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
      {script.pages.map((page, index) => {
        //return <img key={index} src={page.imageUrl} />;
        return (
          <>
            {page.pageNo === viewPageNo && (
              <Annotater imageUrl={page.imageUrl} pageId={page.id} />
            )}
          </>
        );
      })}
      <TogglePageComponent
        pageNo={viewPageNo}
        incrementPageNo={incrementViewPageNo}
        decrementPageNo={decrementViewPageNo}
      />
    </div>
  );
};

export default withRouter(ScriptView);
