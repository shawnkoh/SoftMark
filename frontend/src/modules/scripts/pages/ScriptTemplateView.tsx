import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { AppState } from "../../../types/store";
import api from "../../../api";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";

import Annotator from "../components/annotator/Annotator";
import TogglePageComponent from "../components/misc/TogglePageComponent";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";

type Props = RouteComponentProps;

const ScriptTemplateView: React.FC<Props> = ({ match: { params } }) => {
  const paper_id = +(params as { paper_id: string }).paper_id;
  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);

  const [viewPageNo, setViewPageNo] = useState(1);
  const incrementViewPageNo = () => setViewPageNo(viewPageNo + 1);
  const decrementViewPageNo = () => setViewPageNo(viewPageNo - 1);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  useEffect(() => {
    api.scriptTemplates
      .getScriptTemplate(paper_id)
      .then(resp => {
        console.log(resp);
        setScriptTemplate(resp.data.scriptTemplate);
      })
      .finally(() => setIsLoading(false));

    /*api.scripts.getScripts(paper_id).then(resp => {
      setScripts(resp.data.script);
    });*/
  }, []);

  if (isLoading) {
    return (
      <>
        <LoadingSpinner />
        Loading script...
      </>
    );
  }

  if (!scriptTemplate) {
    return <>The script does not exist</>;
  }

  return (
    <div>
      {scriptTemplate.pageTemplates.map((page, index) => {
        return (
          <>
            {page.pageNo === viewPageNo && (
              <Annotator
                key={page.id}
                pageId={page.id}
                backgroundImageSource={page.imageUrl}
              />
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

export default withRouter(ScriptTemplateView);
