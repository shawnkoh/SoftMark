import { Button, DialogContent, Popover, Slider } from "@material-ui/core";
import { QuestionViewData } from "backend/src/types/view";
import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import useStyles from "./styles";

interface OwnProps {
  anchorEl: HTMLDivElement | null;
  isVisible: boolean;
  question: QuestionViewData;
  onSave: (score: number) => void;
  onCancel: () => void;
}

type Props = OwnProps;

const MarkQuestionModal: React.FC<Props> = ({
  anchorEl,
  isVisible,
  question,
  onSave,
  onCancel
}) => {
  const classes = useStyles();

  const { id, name, score, maxScore, topOffset, leftOffset } = question;

  const [localScore, setLocalScore] = useState<number>(score || 0);
  const handleLocalScoreChange = (event: any, newValue: number | number[]) => {
    setLocalScore(newValue as number);
  };

  const putMarkData = async (questionId: number, score: number) => {
    return await api.marks
      .replaceMark(questionId, { score })
      .then(res => {
        if (res.data.mark) return res.data.mark.score;
        return -1;
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

  const handleSave = async event => {
    const newScore = await putMarkData(id, localScore);
    onSave(newScore);
  };

  const handleUnmark = async event => {
    const newScore = await putMarkData(id, -1); // -1 -> unmark the question
    onSave(newScore);
  };

  return (
    <Popover
      open={isVisible}
      onClose={handleCancel}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left"
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center"
      }}
    >
      <DialogContent className={classes.popover}>
        <div className={classes.slider}>
          <Slider
            value={localScore}
            onChange={handleLocalScoreChange}
            onChangeCommitted={handleSave}
            step={0.5}
            marks={[
              {
                value: 0,
                label: 0
              },
              {
                value: maxScore,
                label: maxScore
              }
            ]}
            min={0}
            max={maxScore}
            valueLabelDisplay="on"
          />
        </div>
        <Button onClick={handleUnmark} fullWidth>
          Unmark
        </Button>
      </DialogContent>
    </Popover>
  );
};

export default MarkQuestionModal;
