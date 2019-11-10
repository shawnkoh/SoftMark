import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../api";
import { Annotation } from "backend/src/types/annotations";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";

import TogglePageComponent from "../../components/misc/TogglePageComponent";
import LoadingSpinner from "../../components/LoadingSpinner";
import Canvas from "../../components/Canvas";
import { CanvasMode } from "../../components/Canvas/types";

type Props = RouteComponentProps;

const ScriptTemplateView: React.FC<Props> = ({ match: { params } }) => {
  const paper_id = +(params as { paper_id: string }).paper_id;
  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);

  const [viewPageNo, setViewPageNo] = useState(1);
  const incrementViewPageNo = () => {
    if (scriptTemplate && scriptTemplate.pageTemplates.length > viewPageNo) {
      setViewPageNo(viewPageNo + 1);
    }
  };
  const decrementViewPageNo = () => {
    if (viewPageNo > 1) {
      setViewPageNo(viewPageNo - 1);
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  const getScriptTemplate = async (paperId: number) => {
    const data = await api.scriptTemplates.getScriptTemplate(paperId);
    setScriptTemplate(data);
    setIsLoading(false);
  };

  useEffect(() => {
    getScriptTemplate(paper_id);
  }, []);

  if (isLoading) {
    return (
      <>
        <LoadingSpinner />
        Loading script template...
      </>
    );
  }

  if (!scriptTemplate) {
    return <>The script does not exist</>;
  }

  return (
    <div style={{ height: "100vh", width: "100vh" }}>
      {scriptTemplate.pageTemplates.map((page, index) => {
        return (
          <>
            {page.pageNo === viewPageNo && (
              <Canvas
                key={page.id}
                backgroundImageSource={page.imageUrl}
                penColor={"#ff0000"}
                penWidth={0}
                mode={CanvasMode.View}
                foregroundAnnotation={[]}
                backgroundAnnotations={[]}
                onForegroundAnnotationChange={(annotation: Annotation) => {}}
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
