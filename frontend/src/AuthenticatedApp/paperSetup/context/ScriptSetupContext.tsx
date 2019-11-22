import api from "api";
import update from "immutability-helper";
import { ScriptTemplateSetupData } from "backend/src/types/scriptTemplates";
import LoadingSpinner from "components/LoadingSpinner";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { toast } from "react-toastify";
import { QuestionTemplateData } from "backend/src/types/questionTemplates";
import QuestionTemplateDialog from "../ScriptTemplateSubpage/ScriptTemplateView/QuestionTemplateDialog";

export interface QuestionGradebox {
  name: string;
  score: number;
  pageCovered: string;
  topOffset: number;
  leftOffset: number;
  displayPage: number;
}

interface LocalState {
  currentPageNo: number;
  leafQuestions: { [id: number]: QuestionGradebox };
}

interface ServerState {
  scriptTemplateSetupData: ScriptTemplateSetupData;
}

interface StaticState {
  pageCount: number;
  goPage(pageNo: number): void;
  refresh: () => void;
  updateLeaf: (id: number, newBox?: Partial<QuestionGradebox>) => void;
  addLeaf: () => void;
  isLeaf: (id: number) => boolean;
}

const ScriptSetupContext = createContext<
  (LocalState & ServerState & StaticState) | null
>(null);

export const ScriptSetupProvider: React.FC = props => {
  const { paper_id } = useParams();
  const history = useHistory();
  const [
    scriptTemplateSetupData,
    setScriptTemplateSetupData
  ] = useState<ScriptTemplateSetupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejected, setIsRejected] = useState(false);
  const [currentPageNo, setCurrentPageNo] = useState<number>(1);
  const [leaves, setLeaves] = useState<{ [id: number]: QuestionGradebox }>({});
  const [questionDialog, setQuestionDialog] = useState<
    number | null | "create"
  >(null);

  // Load Script Template Setup Data
  const [refreshFlag, setRefreshFlag] = useState(0);
  const refresh = () => setRefreshFlag(refreshFlag + 1);
  const getScriptTemplateSetupData = async () => {
    try {
      const { data } = await api.papers.getScriptTemplateSetupData(
        Number(paper_id)
      );
      let newLeaves: { [id: number]: QuestionGradebox } = {};
      data.pageTemplates.map(pt => {
        const addLeaves: {
          [id: number]: QuestionGradebox;
        } = pt.questionTemplates.reduce((map, data) => {
          map[data.id] = {
            name: data.name,
            score: data.score,
            pageCovered: data.pageCovered,
            topOffset: data.topOffset,
            leftOffset: data.leftOffset,
            displayPage: data.displayPage
          };
          return map;
        }, {});
        newLeaves = update(newLeaves, { $merge: addLeaves });
      });
      setLeaves(newLeaves);
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

  const updateLeaf = (id: number, newLeaf?: Partial<QuestionGradebox>) => {
    if (newLeaf) {
      setLeaves(
        update(leaves, {
          [id]: {
            $merge: newLeaf
          }
        })
      );
    } else {
      setQuestionDialog(id);
    }
  };

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
              },
              leafQuestions: leaves,
              isLeaf: (id: number) => id in leaves,
              addLeaf: () => setQuestionDialog("create"),
              updateLeaf: updateLeaf
            }
          : null
      }
    >
      <QuestionTemplateDialog
        mode="create"
        open={questionDialog === "create"}
        handleClose={() => setQuestionDialog(null)}
        onSuccess={(qt: QuestionTemplateData) => {
          if (
            qt.score &&
            qt.pageCovered &&
            qt.topOffset &&
            qt.displayPage &&
            qt.leftOffset
          )
            setLeaves(
              update(leaves, {
                $merge: {
                  [qt.id]: {
                    name: qt.name,
                    score: qt.score,
                    pageCovered: qt.pageCovered,
                    topOffset: qt.topOffset,
                    leftOffset: qt.leftOffset,
                    displayPage: qt.displayPage
                  }
                }
              })
            );
        }}
      />
      {Object.keys(leaves).map(id => (
        <QuestionTemplateDialog
          key={id}
          mode="editLeaf"
          questionTemplateId={+id}
          open={questionDialog === +id}
          handleClose={() => setQuestionDialog(null)}
          initialValues={{
            title: leaves[id].name,
            score: leaves[id].score,
            pageCovered: leaves[id].pageCovered
          }}
          onSuccess={(qt: QuestionTemplateData) => {
            if (qt.score && qt.pageCovered)
              updateLeaf(qt.id, {
                name: qt.name,
                score: qt.score,
                pageCovered: qt.pageCovered
              });
          }}
        />
      ))}
      {props.children}
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
