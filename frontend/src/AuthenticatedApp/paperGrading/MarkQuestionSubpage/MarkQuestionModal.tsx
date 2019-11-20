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
import CustomDialogTitle from "../../../components/dialogs/DialogTitleWithCloseButton";
import useStyles from "./styles";

interface OwnProps {
  question: QuestionViewData;
  render: any;
}

type Props = OwnProps;

const MarkQuestionModal: React.FC<Props> = ({ question, render }) => {
  const classes = useStyles();

  const { id, name, score, maxScore, topOffset, leftOffset } = question;

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [actualScore, setActualScore] = useState<number | null>(score);
  const [localScore, setLocalScore] = useState<number>(score || 0);
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

  const handleSave = async event => {
    const score = await putMarkData(id, localScore);
    setActualScore(score);
    toggleVisibility();
  };

  return (
    <>
      <Dialog open={isVisible} onClose={toggleVisibility} fullWidth>
        <CustomDialogTitle
          id="customized-dialog-title"
          onClose={toggleVisibility}
        >
          Marks for Q{name} {maxScore && ` (Maximum: ${maxScore})`}
        </CustomDialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1">
            Saved score:
            {actualScore !== null
              ? ` ${actualScore} / ${maxScore}`
              : " no score yet"}
          </Typography>
          <div className={classes.slider}>
            <Slider
              value={localScore}
              onChange={handleLocalScoreChange}
              step={0.5}
              marks
              min={0}
              max={maxScore || 100}
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
      {render(toggleVisibility, actualScore, name)}
    </>
  );
};

export default MarkQuestionModal;
