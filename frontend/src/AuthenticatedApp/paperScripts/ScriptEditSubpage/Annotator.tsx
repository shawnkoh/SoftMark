import React, { useState } from "react";
import clsx from "clsx";
import produce from "immer";

import { saveAnnotation } from "../../../api/annotations";
import { Annotation, AnnotationPostData } from "backend/src/types/annotations";
import {
  QuestionViewData,
  PageViewData,
  QuestionTemplateViewData
} from "backend/src/types/view";

import { AppBar, Toolbar, Typography, Chip, Avatar } from "@material-ui/core";

import MarkQuestionModal from "./MarkQuestionModal";
import ReversedChip from "../../../components/ReversedChip";
import { CanvasWithToolbar } from "../../../components/Canvas";
import { Point } from "../../../components/Canvas/types";
import useStyles from "./styles";

interface OwnProps {
  page: PageViewData;
  questions: QuestionViewData[];
  rootQuestionTemplate: QuestionTemplateViewData;
  matriculationNumber: string | null;
}

type Props = OwnProps;

const Annotator: React.FC<Props> = ({
  page,
  questions,
  matriculationNumber
}: Props) => {
  const classes = useStyles();

  interface QuestionState {
    isVisible: boolean;
    question: QuestionViewData;
  }
  const getInitialQuestionStates = (questions: QuestionViewData[]) => {
    const initialQuestionStates: {
      [index: number]: QuestionState;
    } = {};
    questions.forEach((question, index) => {
      initialQuestionStates[index] = { isVisible: false, question };
    });
    return initialQuestionStates;
  };
  const [questionStates, setQuestionStates] = useState<{
    [index: number]: QuestionState;
  }>(getInitialQuestionStates(questions));

  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1.0);
  const handleViewChange = (position: Point, scale: number) => {
    setPosition(position);
    setScale(scale);
  };

  const handleForegroundAnnotationChange = (annotation: Annotation) => {
    const annotationPostData: AnnotationPostData = {
      layer: annotation
    };
    saveAnnotation(page.id, annotationPostData);
  };

  const handleModalCancel = (index: number) =>
    setQuestionStates(
      produce(questionStates, draftState => {
        draftState[index].isVisible = false;
      })
    );

  const handleModalSave = (index: number, score: number) =>
    setQuestionStates(
      produce(questionStates, draftState => {
        draftState[index].isVisible = false;
        draftState[index].question.score = score;
      })
    );

  const handleChipClick = (index: number) =>
    setQuestionStates(
      produce(questionStates, draftState => {
        draftState[index].isVisible = true;
      })
    );

  return (
    <div className={classes.canvasWithToolbarContainer}>
      {questions.map((question, index) => (
        <MarkQuestionModal
          key={index}
          question={question}
          isVisible={questionStates[index].isVisible}
          onCancel={() => handleModalCancel(index)}
          onSave={score => handleModalSave(index, score)}
        />
      ))}
      <CanvasWithToolbar
        drawable
        backgroundImageSource={page.imageUrl || ""}
        backgroundAnnotations={[[]]}
        foregroundAnnotation={
          page.annotations.length > 0 ? page.annotations[0].layer : []
        }
        onForegroundAnnotationChange={handleForegroundAnnotationChange}
        onViewChange={handleViewChange}
      />
      {/*questions.map((question, index) => (
        <ReversedChip
          key={index}
          onClick={() => handleChipClick(index)}
          label={"Q" + question.name}
          avatar={
            <Avatar>{questionStates[index].question.score || "-"}</Avatar>
          }
          color={questionStates[index].question.score ? "primary" : "default"}
          style={{
            position: "absolute",
            left: question.leftOffset * scale + position.x,
            top: question.topOffset * scale + position.y
          }}
        />
        ))*/}
      <AppBar position="fixed" color="inherit" className={classes.questionBar}>
        <Toolbar>
          <Typography
            variant="button"
            className={clsx(classes.grow, classes.questionBarItem)}
          >
            {matriculationNumber || "(Unmatched script)"} page {page.pageNo}
          </Typography>
          {questions.map((question, index) => (
            <ReversedChip
              key={index}
              onClick={() => handleChipClick(index)}
              label={"Q" + question.name}
              avatar={
                <Avatar>{questionStates[index].question.score || "-"}</Avatar>
              }
              color={
                questionStates[index].question.score ? "primary" : "default"
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
