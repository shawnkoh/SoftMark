import React, { useState } from "react";

import api from "../../../api";
import { QuestionViewData } from "backend/src/types/view";

import {
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Slider
} from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import CustomDialogTitle from "../../../components/dialogs/DialogTitleWithCloseButton";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    slider: {
      width: 200
    }
  })
);

interface OwnProps {
  question: QuestionViewData;
  render: any;
}

type Props = OwnProps;

const MarkQuestionModal: React.FC<Props> = ({ question, render }) => {
  const classes = useStyles();

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [actualScore, setActualScore] = useState<number | null>(question.score);
  const [localScore, setLocalScore] = useState<number>(question.score || 0);
  const handleLocalScoreChange = (event: any, newValue: number | number[]) => {
    setLocalScore(newValue as number);
  };

  const putMarkData = async (questionId: number, score: number) => {
    await api.marks.replaceMark(questionId, { score });
    setActualScore(score);
    return score;
  };

  const handleCancel = event => {
    setLocalScore(actualScore || 0);
    toggleVisibility();
  };

  const handleSave = event => {
    putMarkData(question.id, localScore);
  };

  return (
    <>
      <Dialog open={isVisible} onClose={toggleVisibility} fullWidth>
        <CustomDialogTitle
          id="customized-dialog-title"
          onClose={toggleVisibility}
        >
          Mark {question.name}
        </CustomDialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1">
            Current score: {actualScore || "no score yet"}
          </Typography>
          <div className={classes.slider}>
            <Slider
              value={localScore}
              onChange={handleLocalScoreChange}
              step={0.5}
              marks
              min={0}
              max={question.maxScore || 100}
              valueLabelDisplay="on"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {render(toggleVisibility, actualScore, question.name)}
    </>
  );
};

export default MarkQuestionModal;
