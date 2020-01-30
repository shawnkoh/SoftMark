import React from "react";
import { NativeSelect } from "@material-ui/core";
import range from "lodash/range";
import { QuestionViewData } from "backend/src/types/view";
import { toast } from "react-toastify";
import api from "../../../api";
import useStyles from "./styles";

interface OwnProps {
  question: QuestionViewData;
  onSave: (score: number | null, markId: number | null) => void;
}

type Props = OwnProps;

const MarkQuestionSelect: React.FC<Props> = ({ question, onSave }) => {
  const classes = useStyles();

  const { id, markId, score, maxScore } = question;

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

  const handleChange = async event => {
    const value = event.target.value;
    if (value === "-") {
      markId && (await deleteMarkData(markId));
      onSave(null, null);
    } else {
      const newMark = await putMarkData(id, parseFloat(value));
      onSave(newMark.score, newMark.markId);
    }
  };

  return (
    <NativeSelect
      value={score === null ? "-" : score}
      onChange={handleChange}
      className={classes.select}
    >
      <option value={"-"}>-</option>
      {range(0, maxScore + 0.5, 0.5).map((value, index) => (
        <option key={index} value={value}>
          {value}
        </option>
      ))}
    </NativeSelect>
  );
};

export default MarkQuestionSelect;
