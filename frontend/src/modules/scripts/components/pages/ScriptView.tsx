import React, { useEffect, useState, Fragment } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Document, Page } from "react-pdf";
import { getDocument } from "pdfjs-dist";
import { AppState } from "../../../../types/store";
import api from "../../../../api";
import LoadingIcon from "../../../../components/icons/LoadingIcon";
import { PaperData } from "backend/src/types/papers";
import { ScriptData, ScriptListData } from "backend/src/types/scripts";
import Annotator from "../annotator/Annotator";
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
    return (
      <Fragment>
        <LoadingIcon />
        Loading script...
      </Fragment>
    );
  }

  if (!script) {
    return <Fragment>The script does not exist</Fragment>;
  }

  return (
    <div>
      {script.pages.map((page, index) => {
        return (
          <Fragment>
            {page.pageNo === viewPageNo && (
              <Annotator
                key={page.id}
                pageId={page.id}
                backgroundImageSource={page.imageUrl}
              />
            )}
          </Fragment>
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
