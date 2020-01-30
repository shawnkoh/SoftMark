import { AppBar, Avatar, Chip, Toolbar, Typography } from "@material-ui/core";
import { Annotation, AnnotationPostData } from "backend/src/types/annotations";
import { PageViewData, QuestionViewData } from "backend/src/types/view";
import clsx from "clsx";
import produce from "immer";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { saveAnnotation } from "../../../api/annotations";
import { CanvasWithToolbar } from "../../../components/Canvas";
import ReversedChip from "../../../components/ReversedChip";
import useMarkQuestion from "./MarkQuestionContext";
import MarkQuestionSelect from "./MarkQuestionSelect";
import useStyles from "./styles";

interface Props {
  page: PageViewData;
}

interface QuestionState {
  isVisible: boolean;
  question: QuestionViewData;
}

const Annotator: React.FC<Props> = ({ page }: Props) => {
  const classes = useStyles();

  const {
    isPageLoading,
    viewPosition,
    viewScale,
    currentQns,
    updateQuestion,
    handleViewChange,
    foregroundAnnotation,
    scriptMarkingData
  } = useMarkQuestion();

  const { matriculationNumber, rootQuestionTemplate } = scriptMarkingData;

  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);

  useEffect(() => {
    setQuestionStates(
      currentQns.map(question => ({
        isVisible: false,
        question
      }))
    );
  }, [currentQns]);

  const handleForegroundAnnotationChange = (annotation: Annotation) => {
    const annotationPostData: AnnotationPostData = {
      layer: annotation
    };
    saveAnnotation(page.id, annotationPostData).catch(() => {
      toast.error(
        "An error occurred while saving the annotation. Please try refreshing the page."
      );
    });
  };

  const handleModalSave = (
    index: number,
    score: number | null,
    markId: number | null
  ) => {
    setQuestionStates(
      produce(questionStates, draftState => {
        draftState[index].question.score = score;
        draftState[index].question.markId = markId;
      })
    );
    updateQuestion(questionStates[index].question.id, score, markId);
  };

  return (
    <div className={classes.canvasWithToolbarContainer}>
      <CanvasWithToolbar
        drawable
        backgroundImageSource={page.imageUrl || ""}
        backgroundAnnotations={[[]]}
        foregroundAnnotation={foregroundAnnotation}
        onForegroundAnnotationChange={handleForegroundAnnotationChange}
        onViewChange={handleViewChange}
        isLoading={isPageLoading}
      />
      {questionStates.map((questionState: QuestionState, index: number) => (
        <ReversedChip
          key={index}
          label={"Q" + questionState.question.name}
          avatar={
            <Avatar>
              <MarkQuestionSelect
                question={questionState.question}
                onSave={(score, markId) =>
                  handleModalSave(index, score, markId)
                }
              />
              {`/ ${questionState.question.maxScore || "-"}`}
            </Avatar>
          }
          color={questionState.question.score === null ? "default" : "primary"}
          style={{
            position: "absolute",
            left:
              questionState.question.leftOffset * viewScale + viewPosition.x,
            top: questionState.question.topOffset * viewScale + viewPosition.y
          }}
        />
      ))}
      <AppBar position="fixed" color="inherit" className={classes.questionBar}>
        <Toolbar>
          <Typography
            variant="button"
            className={clsx(classes.grow, classes.questionBarItem)}
          >
            {matriculationNumber} page {page.pageNo}
          </Typography>

          <Chip
            label={"Q" + rootQuestionTemplate.name}
            variant="outlined"
            className={classes.questionBarItem}
          />
          {questionStates.map((questionState: QuestionState, index: number) => (
            <ReversedChip
              key={index}
              label={"Q" + questionState.question.name}
              avatar={
                <Avatar>
                  <MarkQuestionSelect
                    question={questionState.question}
                    onSave={(score, markId) =>
                      handleModalSave(index, score, markId)
                    }
                  />
                  {`/ ${questionState.question.maxScore || "-"}`}
                </Avatar>
              }
              color={
                questionState.question.score === null ? "default" : "primary"
              }
              className={classes.questionBarItem}
            />
          ))}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Annotator;
