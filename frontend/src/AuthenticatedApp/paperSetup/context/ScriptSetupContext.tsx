import api from "api";
import { ScriptTemplateSetupData } from "backend/src/types/scriptTemplates";
import LoadingSpinner from "components/LoadingSpinner";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { toast } from "react-toastify";

interface ScriptSetupState {
  scriptTemplateSetupData: ScriptTemplateSetupData;
  currentPageNo: number;
}

interface StaticState {
  pageCount: number;
  goPage(pageNo: number): void;
  refresh(): void;
}

const ScriptSetupContext = createContext<
  (ScriptSetupState & StaticState) | null
>(null);

export const ScriptSetupProvider: React.FC = props => {
  const { children } = props;
  const { paper_id } = useParams();
  const history = useHistory();
  const [
    scriptTemplateSetupData,
    setScriptTemplateSetupData
  ] = useState<ScriptTemplateSetupData | null>(null);
  const [currentPageNo, setCurrentPageNo] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejected, setIsRejected] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const refresh = () => setRefreshFlag(refreshFlag + 1);

  const getScriptTemplateSetupData = async () => {
    try {
      const { data } = await api.papers.getScriptTemplateSetupData(
        Number(paper_id)
      );
      setScriptTemplateSetupData(data);
    } catch (error) {
      setScriptTemplateSetupData(null);
      setIsRejected(true);
      toast.error(
        "An error occured while trying to load the script template. Redirecting you to the home page."
      );
      history.push("/");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getScriptTemplateSetupData();
  }, [paper_id, refreshFlag]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 2 possibilities: paper doesnt exist or user doesnt have permission
  // TODO: Make this nicer
  if (isRejected) {
    return (
      <div>
        <p>
          The Script you are trying to access does not exist. Redirecting you to
          the home page
        </p>
      </div>
    );
  }

  return (
    <ScriptSetupContext.Provider
      value={
        scriptTemplateSetupData
          ? {
              scriptTemplateSetupData: scriptTemplateSetupData,
              currentPageNo: currentPageNo,
              pageCount: scriptTemplateSetupData.pageTemplates.length,
              refresh: refresh,
              goPage: (pageNo: number) => {
                if (
                  currentPageNo > 0 &&
                  currentPageNo <= scriptTemplateSetupData.pageTemplates.length
                )
                  setCurrentPageNo(pageNo);
              }
            }
          : null
      }
    >
      {children}
    </ScriptSetupContext.Provider>
  );
};

export const useScriptSetup = () => {
  const scriptSetup = useContext(ScriptSetupContext);
  if (!scriptSetup) {
    throw new Error("useScriptSetup must be used within a ScriptSetupProvider");
  }
  return scriptSetup;
};

export default useScriptSetup;
