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

import { AppBar, Toolbar, Typography, Avatar } from "@material-ui/core";

import ReversedChip from "../../../components/ReversedChip";
import { CanvasWithToolbar } from "../../../components/Canvas";
import { Point } from "../../../components/Canvas/types";
import MarkQuestionModal from "./MarkQuestionModal";
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
  const initialQuestionStates = questions.map(question => ({
    isVisible: false,
    question
  }));
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    initialQuestionStates
  );

  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1.0);
  const handleViewChange = (position: Point, scale: number) => {
    setPosition(position);
    setScale(scale);
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
      {questionStates.map((questionState: QuestionState, index: number) => (
        <MarkQuestionModal
          key={index}
          question={questionState.question}
          isVisible={questionState.isVisible}
          onCancel={() => handleModalCancel(index)}
          onSave={score => handleModalSave(index, score)}
        />
      ))}
      {/*questionStates.map((questionState: QuestionState, index: number) => (
        <ReversedChip
          key={index}
          onClick={() => handleChipClick(index)}
          label={"Q" + questionState.question.name}
          avatar={<Avatar>{`${questionState.question.score || "-"} / ${questionState
                  .question.maxScore || "-"}`}</Avatar>}
          color={questionState.question.score ? "primary" : "default"}
          style={{
            position: "absolute",
            left: questionState.question.leftOffset * scale + position.x,
            top: questionState.question.topOffset * scale + position.y
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
          {questionStates.map((questionState: QuestionState, index: number) => (
            <ReversedChip
              key={index}
              onClick={() => handleChipClick(index)}
              label={"Q" + questionState.question.name}
              avatar={
                <Avatar>
                  {`${
                    questionState.question.score !== null
                      ? questionState.question.score
                      : "-"
                  } / ${questionState.question.maxScore || "-"}`}
                </Avatar>
              }
              color={
                questionState.question.score !== null ? "primary" : "default"
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
