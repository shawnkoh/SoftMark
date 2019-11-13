import { Fab } from "@material-ui/core";
import { QuestionTemplateData } from "backend/src/types/questionTemplates";
import React from "react";
import { useDrag } from "react-dnd";
import QuestionTemplateDialog from "../components/QuestionTemplateDialog";
import useStyles from "./useStyles";

interface ScriptTemplateQuestionProps {
  index: number;
  questionTemplate: QuestionTemplateData;
  onEditSuccess: (qTemplate: QuestionTemplateData) => void;
  currentPageNo: number;
  pageCount: number;
}

type Props = ScriptTemplateQuestionProps;

const ScriptTemplateQuestion: React.FC<Props> = ({
  index,
  questionTemplate,
  onEditSuccess,
  currentPageNo,
  pageCount
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
        mode="edit"
        scriptTemplateId={questionTemplate.scriptTemplateId}
        questionTemplateId={questionTemplate.id}
        open={editOpen}
        handleClose={() => setEditOpen(false)}
        onSuccess={onEditSuccess}
        onDeleteSuccess={() => setEditOpen(false)}
        initialValues={{
          title: questionTemplate.name,
          score: questionTemplate.score ? questionTemplate.score : 0,
          pageCovered: ""
        }}
        pageCount={pageCount}
        currentPageNo={currentPageNo}
      />
      <Fab
        variant="extended"
        ref={drag}
        className={classes.fab}
        style={{
          top:
            questionTemplate.topOffset != null
              ? questionTemplate.topOffset
              : 50,
          left:
            questionTemplate.leftOffset != null
              ? questionTemplate.leftOffset
              : 50
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
