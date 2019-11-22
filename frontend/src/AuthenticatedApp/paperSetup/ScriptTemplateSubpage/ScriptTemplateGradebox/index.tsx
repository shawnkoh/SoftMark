import { Avatar } from "@material-ui/core";
import React from "react";
import { useDrag } from "react-dnd";
import ReversedChip from "../../../../components/ReversedChip";
import useStyles from "./useStyles";
import useScriptSetup from "AuthenticatedApp/paperSetup/context/ScriptSetupContext";

interface QuestionGradeboxProps {
  id: number;
  imgScale: number;
}

type Props = QuestionGradeboxProps;

const ScriptTemplateQuestion: React.FC<Props> = ({ id, imgScale }) => {
  const classes = useStyles();
  const { leafQuestions, updateLeaf } = useScriptSetup();
  const [{ isDragging }, drag] = useDrag({
    item: { ...leafQuestions[id], id, type: "questionBox" },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  if (isDragging) {
    return <div ref={drag} />;
  }
  return (
    <ReversedChip
      ref={drag}
      avatar={<Avatar>{leafQuestions[id].score || "-"}</Avatar>}
      label={"Q" + leafQuestions[id].name}
      onClick={() => updateLeaf(id)}
      color="primary"
      className={classes.chip}
      style={{
        top: leafQuestions[id].topOffset * imgScale,
        left: leafQuestions[id].leftOffset * imgScale
      }}
    />
  );
};

export default ScriptTemplateQuestion;
