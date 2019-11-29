import { AppBar, Avatar, Toolbar, Typography } from "@material-ui/core";
import {
  PageViewData,
  QuestionTemplateViewData,
  QuestionViewData
} from "backend/src/types/view";
import clsx from "clsx";
import produce from "immer";
import React, { useState } from "react";
import { Point } from "../../../components/Canvas/types";
import ReversedChip from "../../../components/ReversedChip";
import MarkQuestionModal from "./MarkQuestionModal";
import useStyles from "./styles";

interface Props {
  page: PageViewData;
  questions: QuestionViewData[];
  rootQuestionTemplate: QuestionTemplateViewData;
  matriculationNumber: string | null;
}

interface QuestionState {
  isVisible: boolean;
  question: QuestionViewData;
}

const Annotator: React.FC<Props> = ({
  page,
  questions,
  matriculationNumber
}: Props) => {
  const classes = useStyles();

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
            {matriculationNumber} page {page.pageNo}
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
