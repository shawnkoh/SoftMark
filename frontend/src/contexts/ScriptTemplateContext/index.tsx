import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import api from "../../api";
import LoadingSpinner from "../../components/LoadingSpinner";

type ScriptTemplateContextProps =
  | ({
      scriptTemplate: ScriptTemplateData | null;
      refreshScriptTemplate: () => void;
    })
  | null;

const ScriptTemplateContext = React.createContext<ScriptTemplateContextProps>(
  null
);

export const ScriptTemplateProvider: React.FC = props => {
  const { children } = props;
  const { paper_id } = useParams();

  if (!paper_id) {
    throw new Error("ScriptTemplateProvider cannnot be used without paper_id");
  }

  const paperId = Number(paper_id);

  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);
  const [isLoadingScriptTemplate, setIsLoadingScriptTemplate] = useState(true);

  const getScriptTemplate = () => {
    api.scriptTemplates
      .getScriptTemplate(paperId)
      .then(resp => setScriptTemplate(resp.data.scriptTemplate))
      .finally(() => setIsLoadingScriptTemplate(false));
  };

  useEffect(getScriptTemplate, [paper_id]);

  if (isLoadingScriptTemplate) {
    return <LoadingSpinner loadingMessage="Loading script template..." />;
  }

  return (
    <ScriptTemplateContext.Provider
      value={
        paperId
          ? {
              scriptTemplate,
              refreshScriptTemplate: getScriptTemplate
            }
          : null
      }
    >
      {children}
    </ScriptTemplateContext.Provider>
  );
};

export const useScriptTemplate = () => {
  const scriptTemplate = useContext(ScriptTemplateContext);
  if (!scriptTemplate) {
    throw new Error(
      "useScriptTemplate must be used within a ScriptTemplateProvider"
    );
  }
  return scriptTemplate;
};

export default useScriptTemplate;
