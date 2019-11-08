import React from "react";
import { useDrag } from "react-dnd";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { Fab, Avatar } from "@material-ui/core";
import QuestionEditDialog, {
  QuestionEditDialogProps,
  NewQuestionValues
} from "./QuestionEditDialog";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      position: "absolute",
      cursor: "move",
      padding: theme.spacing(2),
      fontSize: theme.typography.body1.fontSize
    },
    score: {
      marginLeft: theme.spacing(1),
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.background.paper,
      borderRadius: 15,
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1)
    }
  })
);

interface QuestionBoxProps {
  id: string;
  left: number;
  top: number;
  title: string;
  score: number;

  initialValues: NewQuestionValues;
  onSubmit: (values: NewQuestionValues) => Promise<any>;
  handleDelete: () => Promise<any>;
  currentPage: number;
  pageCount: number;
}

type Props = QuestionBoxProps;

const QuestionBox: React.FC<Props> = ({
  id,
  left,
  top,
  title,
  score,
  ...dialogProps
}) => {
  const classes = useStyles();
  const [editOpen, setEditOpen] = React.useState(false);
  const [{ isDragging }, drag] = useDrag({
    item: { id, left, top, type: "questionBox" },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  if (isDragging) {
    return <div ref={drag} />;
  }
  return (
    <>
      <QuestionEditDialog
        open={editOpen}
        handleClose={() => setEditOpen(false)}
        handleDelete={() =>
          dialogProps.handleDelete().finally(() => setEditOpen(false))
        }
        initialValues={{ title: title, score: score, pageCovered: "" }}
        pageCount={dialogProps.pageCount}
        currentPage={dialogProps.currentPage}
        onSubmit={value =>
          dialogProps.onSubmit(value).finally(() => setEditOpen(false))
        }
      />
      <Fab
        variant="extended"
        ref={drag}
        className={classes.fab}
        style={{ left, top }}
        color="primary"
        onClick={() => setEditOpen(true)}
      >
        {title}
        <div className={classes.score}>{score}</div>
      </Fab>
    </>
  );
};

export default QuestionBox;
