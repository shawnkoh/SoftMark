import { Button, DialogContent, Popover, Slider } from "@material-ui/core";
import { QuestionViewData } from "backend/src/types/view";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../../api";
import useStyles from "./styles";

interface OwnProps {
  anchorEl: HTMLDivElement | null;
  isVisible: boolean;
  question: QuestionViewData;
  onSave: (score: number | null, markId: number | null) => void;
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

  const { id, markId, score, maxScore } = question;

  const [localScore, setLocalScore] = useState<number>(score || 0);

  useEffect(() => {
    setLocalScore(score || 0);
  }, [id, score]);

  const handleLocalScoreChange = (newValue: number | number[]) => {
    setLocalScore(newValue as number);
  };

  const putMarkData = async (questionId: number, score: number) => {
    return await api.marks
      .replaceMark(questionId, { score })
      .then(res => {
        if (res.data.mark)
          return { score: res.data.mark.score, markId: res.data.mark.id };
        return { score: score, markId: null };
      })
      .catch(() => {
        toast.error("An error was made when saving. Try refreshing the page.");
        return { score: score, markId: null };
      });
  };

  const deleteMarkData = async (markId: number) => {
    return await api.marks.discardMark(markId).catch(() => {
      toast.error(
        "An error was made when discarding. Try refreshing the page."
      );
    });
  };

  const handleCancel = () => {
    setLocalScore(score || 0);
    onCancel();
  };

  const handleSave = async () => {
    const newMark = await putMarkData(id, localScore);
    onSave(newMark.score, newMark.markId);
  };

  const handleUnmark = async () => {
    markId && await deleteMarkData(markId);
    onSave(null, null);
    handleLocalScoreChange(0);
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
            onChange={(e, v) => {handleLocalScoreChange(v);}}
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
        {markId !== null && (
          <Button onClick={handleUnmark} fullWidth>
            Unmark
          </Button>
        )}
      </DialogContent>
    </Popover>
  );
};

export default MarkQuestionModal;
