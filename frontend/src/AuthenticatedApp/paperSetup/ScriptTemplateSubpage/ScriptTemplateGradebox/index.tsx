import { Avatar } from "@material-ui/core";
import { QuestionTemplateLeafData } from "backend/src/types/questionTemplates";
import React from "react";
import { useDrag } from "react-dnd";
import ReversedChip from "../../../../components/ReversedChip";
import QuestionTemplateDialog from "../ScriptTemplateView/QuestionTemplateDialog";
import useStyles from "./useStyles";

interface ScriptTemplateQuestionProps {
  index: number;
  questionTemplate: QuestionTemplateLeafData;
}

type Props = ScriptTemplateQuestionProps;

const ScriptTemplateQuestion: React.FC<Props> = ({
  index,
  questionTemplate
}) => {
  const classes = useStyles();
  const [editOpen, setEditOpen] = React.useState(false);
  const [{ isDragging }, drag] = useDrag({
    item: { ...questionTemplate, index, type: "questionBox" },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  if (isDragging) {
    return <div ref={drag} />;
  }
  return (
    <>
      <QuestionTemplateDialog
        mode="editLeaf"
        questionTemplateId={questionTemplate.id}
        open={editOpen}
        handleClose={() => setEditOpen(false)}
        initialValues={{
          title: questionTemplate.name,
          score: questionTemplate.score,
          pageCovered: questionTemplate.pageCovered
        }}
      />
      <ReversedChip
        ref={drag}
        avatar={<Avatar>{questionTemplate.score || "-"}</Avatar>}
        label={"Q" + questionTemplate.name}
        onClick={() => setEditOpen(true)}
        color="primary"
        className={classes.chip}
        style={{
          top: questionTemplate.topOffset,
          left: questionTemplate.leftOffset
        }}
      />
    </>
  );
};

export default ScriptTemplateQuestion;
