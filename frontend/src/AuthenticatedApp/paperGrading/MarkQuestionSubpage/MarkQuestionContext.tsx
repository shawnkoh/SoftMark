import React, { createContext, useContext, useState, useEffect } from "react";
import { Point } from "../../../components/Canvas/types";
import {
  ScriptMarkingData,
  PageViewData,
  QuestionViewData
} from "backend/src/types/view";
import api from "api";
import produce from "immer";
import { useParams } from "react-router";
import LoadingSpinner from "components/LoadingSpinner";
import { toast } from "react-toastify";
import { Annotation } from "backend/src/types/annotations";

interface DynamicState {
  scriptMarkingData: ScriptMarkingData;
  foregroundAnnotation: Annotation;
  pages: PageViewData[];
  currentPageIdx: number;
  currentQns: QuestionViewData[];
  isLoading: boolean;
  isPageLoading: boolean;
  viewPosition: Point;
  viewScale: number;
}

interface StaticState {
  updateQuestion: (
    questionId: number,
    score: number | null,
    markId: number | null
  ) => void;
  handlePrevClick: () => void;
  handleNextClick: () => void;
  handleNextUnmarkedClick: () => void;
  handleViewChange: (position: Point, scale: number) => void;
  incrementPageNo: () => void;
  decrementPageNo: () => void;
}

const MarkQuestionContext = createContext<(DynamicState & StaticState) | null>(
  null
);

export const MarkQuestionProvider: React.FC = props => {
  const { questionTemplateId: questionTemplateIdString } = useParams();
  const questionTemplateId = Number(questionTemplateIdString);

  // Page data states
  const [foregroundAnnotation, setForegroundAnnotation] = useState<Annotation>(
    []
  );
  const [
    scriptMarkingData,
    setScriptMarkingData
  ] = useState<ScriptMarkingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedNewScript, setFetchedNewScript] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);
  const [currentQns, setCurrentQns] = useState<QuestionViewData[]>([]);
  const [pages, setPages] = useState<PageViewData[]>([]);

  // Pan and zoom states
  const [viewPosition, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [viewScale, setScale] = useState<number>(1.0);

  // Page data api calls
  const getNextScriptToMarkData = async (questionTemplateId: number) => {
    try {
      const response = await api.questionTemplates.getNextScriptToMark(
        questionTemplateId
      );
      if (response.data) {
        getScriptMarkingData(
          response.data.scriptId,
          response.data.rootQuestionTemplateId
        );
      } else {
        setScriptMarkingData(null);
      }
    } catch (error) {
      toast.error(
        "An error occured while trying to load the script. Please refresh."
      );
    }
  };

  const getScriptMarkingData = async (
    scriptId: number,
    questionTemplateId: number
  ) => {
    try {
      const response = await api.scripts.markScript(
        scriptId,
        questionTemplateId
      );
      setScriptMarkingData(response.data);
      const tempPages = response.data.pages.sort((a, b) =>
        a.pageNo < b.pageNo ? -1 : 1
      );
      setPages(tempPages);
      if (response.data.questions.length > 0) {
        let defaultDisplayedPage = response.data.questions[0].displayPage;
        response.data.questions.forEach(q => {
          defaultDisplayedPage = Math.min(defaultDisplayedPage, q.displayPage);
        });
        setCurrentPageIdx(
          tempPages.findIndex(p => p.pageNo === defaultDisplayedPage)
        );
      }
    } catch (error) {
      setScriptMarkingData(null);
      toast.error(
        "An error occured while trying to load the script. Please refresh."
      );
    }
    setFetchedNewScript(!fetchedNewScript);
  };

  const getForegroundAnnotations = async (pages: PageViewData[]) => {
    try {
      const response = await api.annotations.getOwnAnnotation(
        pages[currentPageIdx].id
      );
      if (response.status === 200)
        setForegroundAnnotation(response.data.annotation.layer);
      else if (response.status === 204) setForegroundAnnotation([]);
    } catch (error) {
      toast.error(
        "An error occured while trying to load the annotations. Please refresh."
      );
    }
    setIsPageLoading(false);
    setIsLoading(false);
  };

  // Page data effect hooks
  useEffect(() => {
    getNextScriptToMarkData(questionTemplateId);
  }, [questionTemplateId]);

  useEffect(() => {
    if (scriptMarkingData) {
      setIsPageLoading(true);
      setForegroundAnnotation([]);
      getForegroundAnnotations(scriptMarkingData.pages);
    }
  }, [fetchedNewScript, currentPageIdx]);

  useEffect(() => {
    if (scriptMarkingData && pages.length > 0) {
      setCurrentQns(
        scriptMarkingData.questions.filter(
          q => q.displayPage === pages[currentPageIdx].pageNo
        )
      );
    }
  }, [scriptMarkingData, currentPageIdx, pages]);

  if (isLoading) return <LoadingSpinner />;

  // Page data methods
  const updateQuestion = (
    questionId: number,
    score: number | null,
    markId: number | null
  ) => {
    if (scriptMarkingData !== null)
      setScriptMarkingData(
        produce(scriptMarkingData, draftState => {
          draftState.questions.map(q => {
            if (q.id === questionId)
              return produce(q, ds => {
                ds.score = score;
                ds.markId = markId;
              });
            return q;
          });
        })
      );
  };

  const handlePrevClick = () => {
    if (scriptMarkingData) {
      const prevScriptId = scriptMarkingData.previousScriptId;
      if (prevScriptId) {
        getScriptMarkingData(prevScriptId, questionTemplateId);
      }
    }
  };

  const handleNextClick = () => {
    if (scriptMarkingData) {
      const nextScriptId = scriptMarkingData.nextScriptId;
      if (nextScriptId) {
        getScriptMarkingData(nextScriptId, questionTemplateId);
      }
    }
  };

  const handleNextUnmarkedClick = () => {
    getNextScriptToMarkData(questionTemplateId);
  };

  // Pan and zoom methods
  const handleViewChange = (position: Point, scale: number) => {
    setPosition(position);
    setScale(scale);
  };

  // Script page change methods
  const incrementPageNo = () =>
    setCurrentPageIdx(prevPageIdx => {
      const nextPageNo = prevPageIdx + 1;
      return Math.min(nextPageNo, Object.keys(pages).length - 1);
    });
  const decrementPageNo = () =>
    setCurrentPageIdx(prevPageIdx => {
      const nextPageNo = prevPageIdx - 1;
      return Math.max(0, nextPageNo);
    });

  return (
    <MarkQuestionContext.Provider
      value={
        scriptMarkingData
          ? {
              scriptMarkingData,
              foregroundAnnotation,
              currentPageIdx,
              currentQns,
              pages,
              isLoading,
              isPageLoading,
              viewPosition,
              viewScale,
              updateQuestion,
              handlePrevClick,
              handleNextClick,
              handleNextUnmarkedClick,
              handleViewChange,
              incrementPageNo,
              decrementPageNo
            }
          : null
      }
    >
      {props.children}
    </MarkQuestionContext.Provider>
  );
};

export const useMarkQuestion = () => {
  const markQuestion = useContext(MarkQuestionContext);
  if (!markQuestion) {
    throw new Error(
      "useMarkQuestion must be used within a MarkQuestionProvider"
    );
  }
  return markQuestion;
};

export default useMarkQuestion;
