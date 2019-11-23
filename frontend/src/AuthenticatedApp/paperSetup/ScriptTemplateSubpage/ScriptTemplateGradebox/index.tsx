import { Avatar } from "@material-ui/core";
import React, { useState } from "react";
import Draggable, { DraggableData, DraggableEvent, DraggableCore } from "react-draggable";
import ReversedChip from "../../../../components/ReversedChip";
import useStyles from "./useStyles";
import useScriptSetup from "AuthenticatedApp/paperSetup/context/ScriptSetupContext";
import { toast } from "react-toastify";
import api from "../../../../api";

interface QuestionGradeboxProps {
  id: number;
  imgScale: number;
}

type Props = QuestionGradeboxProps;

const ScriptTemplateQuestion: React.FC<Props> = ({ id, imgScale }) => {
  const classes = useStyles();
  const { leafQuestions, updateLeaf, refresh } = useScriptSetup();
  const leafQuestion = leafQuestions[id];
  const [offset, setOffset] = useState<{top: number, left: number}>({top: leafQuestion.topOffset, left: leafQuestion.leftOffset})

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    setOffset({
      top: offset.top + data.deltaY / imgScale,
      left: offset.left + data.deltaX / imgScale
    })
  };

  const handleDrop = async (data: DraggableData) => {
    const leftOffset = Math.round(offset.left);
    const topOffset = Math.round(offset.top);
    updateLeaf(id, { leftOffset, topOffset });
    try {
      await api.questionTemplates.editQuestionTemplate(id, {
        topOffset,
        leftOffset
      });
      refresh();
    } catch (error) {
      toast.error(`Failed to move ${leafQuestion.name}`);
    }
  };
  
  return (
    <DraggableCore
      onDrag={handleDrag}
      onStop={(e: DraggableEvent, data: DraggableData) => {handleDrop(data)}}
    >
      <ReversedChip
        avatar={<Avatar>{leafQuestion.score || "-"}</Avatar>}
        label={"Q" + leafQuestion.name}
        onDoubleClick={() => updateLeaf(id)}
        color="primary"
        className={classes.chip}
        style={{
          top: offset.top * imgScale,
          left: offset.left * imgScale
        }}  
      />
    </DraggableCore>
  );
};

export default ScriptTemplateQuestion;
