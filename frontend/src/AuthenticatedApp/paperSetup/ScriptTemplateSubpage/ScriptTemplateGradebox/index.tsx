import { Fab } from "@material-ui/core";
import { QuestionTemplateLeafData } from "backend/src/types/questionTemplates";
import React from "react";
import { useDrag } from "react-dnd";
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
      <Fab
        variant="extended"
        ref={drag}
        className={classes.fab}
        style={{
          top: questionTemplate.topOffset,
          left: questionTemplate.leftOffset
        }}
        color="primary"
        onClick={() => setEditOpen(true)}
      >
        {questionTemplate.name}
        <div className={classes.score}>
          {questionTemplate.score ? questionTemplate.score : "n/a"}
        </div>
      </Fab>
    </>
  );
};

export default ScriptTemplateQuestion;
