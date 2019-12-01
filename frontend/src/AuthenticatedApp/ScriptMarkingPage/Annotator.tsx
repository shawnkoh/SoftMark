import { AppBar, Avatar, Chip, Toolbar, Typography } from "@material-ui/core";
import { Annotation, AnnotationPostData } from "backend/src/types/annotations";
import {
  PageViewData,
  QuestionTemplateViewData,
  QuestionViewData
} from "backend/src/types/view";
import clsx from "clsx";
import produce from "immer";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { saveAnnotation } from "../../api/annotations";
import { CanvasWithToolbar } from "../../components/Canvas";
import ReversedChip from "../../components/ReversedChip";
import useMarkQuestion from "./MarkQuestionContext";
import MarkQuestionModal from "./MarkQuestionModal";
import useStyles from "./styles";

interface OwnProps {
  page: PageViewData;
  foregroundAnnotation: Annotation;
  questions: QuestionViewData[];
  rootQuestionTemplate: QuestionTemplateViewData;
  matriculationNumber: string | null;
}

type Props = OwnProps;

const Annotator: React.FC<Props> = ({
  page,
  foregroundAnnotation,
  questions,
  rootQuestionTemplate,
  matriculationNumber
}: Props) => {
  const classes = useStyles();

  interface QuestionState {
    isVisible: boolean;
    question: QuestionViewData;
  }
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const { viewPosition, viewScale, handleViewChange } = useMarkQuestion();

  useEffect(() => {
    setQuestionStates(
      questions.map(question => ({
        isVisible: false,
        question
      }))
    );
  }, [questions]);

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

  const handleModalCancel = (index: number) => {
    setQuestionStates(
      produce(questionStates, draftState => {
        draftState[index].isVisible = false;
      })
    );
    setAnchorEl(null);
  };

  const handleModalSave = (index: number, score: number | null, markId: number | null) => {
    setQuestionStates(
      produce(questionStates, draftState => {
        draftState[index].isVisible = false;
        draftState[index].question.score = score;
        draftState[index].question.markId = markId;
      })
    );
    setAnchorEl(null);
  };

  const handleChipClick = (
    event: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    setAnchorEl(event.currentTarget);
    setQuestionStates(
      produce(questionStates, draftState => {
        draftState[index].isVisible = true;
      })
    );
  };

  return (
    <div className={classes.canvasWithToolbarContainer}>
      {questionStates.map((questionState: QuestionState, index: number) => (
        <MarkQuestionModal
          key={index}
          anchorEl={anchorEl}
          question={questionState.question}
          isVisible={questionState.isVisible}
          onCancel={() => handleModalCancel(index)}
          onSave={(score, markId) => handleModalSave(index, score, markId)}
        />
      ))}
      <CanvasWithToolbar
        drawable
        backgroundImageSource={page.imageUrl || ""}
        backgroundAnnotations={[[]]}
        foregroundAnnotation={foregroundAnnotation}
        onForegroundAnnotationChange={handleForegroundAnnotationChange}
        onViewChange={handleViewChange}
      />
      {questionStates.map((questionState: QuestionState, index: number) => (
        <ReversedChip
          key={index}
          onClick={event => handleChipClick(event, index)}
          label={"Q" + questionState.question.name}
          avatar={
            <Avatar>{`${
              questionState.question.score === null
                ? "-"
                : questionState.question.score
            } / ${questionState.question.maxScore || "-"}`}</Avatar>
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
              onClick={event => handleChipClick(event, index)}
              label={"Q" + questionState.question.name}
              avatar={
                <Avatar>{`${
                  questionState.question.score === null
                    ? "-"
                    : questionState.question.score
                } / ${questionState.question.maxScore || "-"}`}</Avatar>
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
