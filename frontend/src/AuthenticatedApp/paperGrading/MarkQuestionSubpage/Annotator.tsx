import React, { useState, useEffect } from "react";
import clsx from "clsx";
import produce from "immer";

import { getOwnAnnotation, saveAnnotation } from "../../../api/annotations";
import { Annotation, AnnotationPostData } from "backend/src/types/annotations";
import {
  QuestionViewData,
  PageViewData,
  QuestionTemplateViewData
} from "backend/src/types/view";

import { AppBar, Toolbar, Typography, Chip, Avatar } from "@material-ui/core";

import ReversedChip from "../../../components/ReversedChip";
import { CanvasWithToolbar } from "../../../components/Canvas";
import { Point } from "../../../components/Canvas/types";
import MarkQuestionModal from "./MarkQuestionModal";
import useStyles from "./styles";

interface OwnProps {
  page: PageViewData;
  questions: QuestionViewData[];
  rootQuestionTemplate: QuestionTemplateViewData;
  //matriculationNumber: string | null;
}

type Props = OwnProps;

const Annotator: React.FC<Props> = ({
  page,
  questions,
  rootQuestionTemplate
}: //matriculationNumber
Props) => {
  const classes = useStyles();

  const [foregroundAnnotation, setForegroundAnnotation] = useState<Annotation>(
    page.annotations.length > 0 ? page.annotations[0].layer : []
  );
  /*
  const [
    isLoadingForegroundAnnotation,
    setIsLoadingForegroundAnnotation
  ] = useState(true);

  const getForegroundAnnotation = () => {
    getOwnAnnotation(page.id)
      .then(res => {
        const savedAnnotation = res.data.annotation;
        setForegroundAnnotation(savedAnnotation.layer || []);
      })
      .catch(() => setForegroundAnnotation([]))
      .finally(() => setIsLoadingForegroundAnnotation(false));
  };
  useEffect(getForegroundAnnotation, []);
  */

  const handleForegroundAnnotationChange = (annotation: Annotation) => {
    const annotationPostData: AnnotationPostData = {
      layer: annotation
    };
    saveAnnotation(page.id, annotationPostData);
  };

  interface QuestionState {
    isVisible: boolean;
    question: QuestionViewData;
  }
  const initialQuestionStates = questions.map(question => ({
    isVisible: false,
    question
  }));
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    initialQuestionStates
  );
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1.0);
  const handleViewChange = (position: Point, scale: number) => {
    setPosition(position);
    setScale(scale);
  };

  const handleModalCancel = (index: number) => {
    setQuestionStates(
      produce(questionStates, draftState => {
        draftState[index].isVisible = false;
      })
    );
    setAnchorEl(null);
  };

  const handleModalSave = (index: number, score: number) => {
    setQuestionStates(
      produce(questionStates, draftState => {
        draftState[index].isVisible = false;
        draftState[index].question.score = score;
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
          onSave={score => handleModalSave(index, score)}
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
            left: questionState.question.leftOffset * scale + position.x,
            top: questionState.question.topOffset * scale + position.y
          }}
        />
      ))}
      <AppBar position="fixed" color="inherit" className={classes.questionBar}>
        <Toolbar>
          {/*<Typography
            variant="button"
            className={clsx(classes.grow, classes.questionBarItem)}
          >
            {matriculationNumber || "(Unmatched script)"} page {page.pageNo}
          </Typography>
          */}
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
