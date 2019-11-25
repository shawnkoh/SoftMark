import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Slider,
  Typography
} from "@material-ui/core";
import { QuestionViewData } from "backend/src/types/view";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";
import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../api";
import CustomDialogTitle from "../../../components/dialogs/DialogTitleWithCloseButton";
import useStyles from "./styles";

interface OwnProps {
  isVisible: boolean;
  question: QuestionViewData;
  onSave: (score: number) => void;
  onCancel: () => void;
}

type Props = OwnProps;

const MarkQuestionModal: React.FC<Props> = ({
  isVisible,
  question,
  onSave,
  onCancel
}) => {
  const classes = useStyles();
  const { refreshScripts } = useScriptsAndStudents();

  const { id, name, score, maxScore, topOffset, leftOffset } = question;

  const [localScore, setLocalScore] = useState<number>(score || 0);
  const handleLocalScoreChange = (event: any, newValue: number | number[]) => {
    setLocalScore(newValue as number);
  };

  const putMarkData = async (questionId: number, score: number) => {
    return await api.marks
      .replaceMark(questionId, { score })
      .then(res => {
        refreshScripts();
        const newScore = res.data.mark.score;
        return newScore;
      })
      .catch(() => {
        toast.error("An error was made when saving. Try refreshing the page.");
        return score;
      });
  };

  const handleCancel = event => {
    setLocalScore(score || 0);
    onCancel();
  };

  const handleSave = event => {
    putMarkData(id, localScore);
    onSave(localScore);
  };

  return (
    <>
      <Dialog open={isVisible} onClose={onCancel} fullWidth>
        <CustomDialogTitle id="customized-dialog-title" onClose={onCancel}>
          Marks for Q{name} {maxScore && ` (Maximum: ${maxScore})`}
        </CustomDialogTitle>
        <DialogContent dividers>
          <Typography variant="overline">Saved score</Typography>
          <Typography variant="h5">
            {score !== null
              ? `${score} / ${maxScore}`
              : `no score yet (maximum: ${maxScore})`}
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
    </>
  );
};

export default MarkQuestionModal;
