import React, { useState, useRef } from "react";
import { useDrop, XYCoord } from "react-dnd";
import api from "../../../api";

import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import { Grid, Fab, IconButton } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import update from "immutability-helper";
import { generatePages } from "../../../utils/questionAllocationUtil";
import QuestionBox from "./QuestionBox";
import ForwardIcon from "@material-ui/icons/ArrowForwardIos";
import BackIcon from "@material-ui/icons/ArrowBackIos";
import QuestionEditDialog, { NewQuestionValues } from "./QuestionEditDialog";
import AddIcon from "@material-ui/icons/Add";

const useStyles = makeStyles((theme: Theme) => ({
  addFab: {
    position: "absolute",
    right: theme.spacing(2),
    bottom: theme.spacing(2)
  },
  container: {
    position: "relative"
  },
  scriptImage: {
    objectFit: "contain",
    height: "calc(100vh - 64px)"
  },
  pageToggleRight: {
    position: "absolute",
    top: "50%",
    right: 0,
    zIndex: 1
  },
  pageToggleLeft: {
    position: "absolute",
    top: "50%",
    left: 0,
    zIndex: 1
  }
}));

type QuestionesBoxes = {
  [page: number]: {
    [id: string]: {
      top: number | null;
      left: number | null;
      title: string;
      score: number | null;
    };
  };
};

interface DragItem {
  top: number;
  left: number;
  id: string;
  type: string;
}

interface OwnProps {
  scriptTemplate: ScriptTemplateData;
  viewPageNo: number;
  setViewPage: (newPage: number) => void;
}

type Props = OwnProps;

const QuestionContainer: React.FC<Props> = ({
  scriptTemplate,
  viewPageNo,
  setViewPage
}) => {
  const classes = useStyles();
  const [boxes, setBoxes] = useState<QuestionesBoxes>(
    scriptTemplate.questionTemplates.reduce((map, question) => {
      generatePages("1-3").forEach(element => {
        if (!map[element]) map[element] = {};
        map[element][question.id] = {
          top: question.topOffset,
          left: question.leftOffset,
          title: question.name,
          score: question.score
        };
      });
      return map;
    }, {})
  );
  const incrementViewPageNo = () => setViewPage(viewPageNo + 1);
  const decrementViewPageNo = () => setViewPage(viewPageNo - 1);
  const [, drop] = useDrop({
    accept: "questionBox",
    drop(item: DragItem, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
      const left = Math.round(item.left + delta.x);
      const top = Math.round(item.top + delta.y);
      api.questionTemplates.editQuestionTemplate(+item.id, {
        topOffset: top,
        leftOffset: left
      });
      moveBox(item.id, left, top);
      return undefined;
    }
  });
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const moveBox = (id: string, left: number, top: number) => {
    setBoxes(
      update(boxes, { [viewPageNo]: { [id]: { $merge: { left, top } } } })
    );
  };

  const onSubmit = (values: NewQuestionValues) =>
    api.questionTemplates
      .createQuestionTemplate(scriptTemplate.id, {
        name: values.title,
        score: values.score,
        pageCovered: values.pageCovered
      })
      .then(resp => {
        console.log(resp);
        const qTemplate = resp.data.questionTemplate;
        update(boxes, {
          [viewPageNo]: {
            $merge: {
              [qTemplate.id]: {
                title: qTemplate.name,
                score: qTemplate.score,
                left: qTemplate.leftOffset,
                top: qTemplate.topOffset
              }
            }
          }
        });
      });

  const onEditSubmit = (id: number) => (values: NewQuestionValues) =>
    api.questionTemplates
      .editQuestionTemplate(id, {
        name: values.title,
        score: values.score
      })
      .then(resp => {
        const qTemplate = resp.data.questionTemplate;
        update(boxes, {
          [viewPageNo]: {
            $merge: {
              [qTemplate.id]: {
                title: qTemplate.name,
                score: qTemplate.score,
                left: qTemplate.leftOffset,
                top: qTemplate.topOffset
              }
            }
          }
        });
      });

  const handleDelete = (id: number) => () =>
    api.questionTemplates.discardQuestionTemplate(id).then(resp => {
      if (resp.status === 264) {
        let newBoxes = boxes;
        delete newBoxes[viewPageNo][id];
        setBoxes(newBoxes);
      }
    });

  const imgUrl = scriptTemplate.pageTemplates.filter(
    value => value.pageNo === viewPageNo
  )[0].imageUrl;

  return (
    <>
      <Fab onClick={handleClickOpen} color="primary" className={classes.addFab}>
        <AddIcon />
      </Fab>
      <QuestionEditDialog
        open={open}
        handleClose={handleClose}
        initialValues={{ title: "", score: 0, pageCovered: "" }}
        pageCount={scriptTemplate.pageTemplates.length}
        currentPage={viewPageNo}
        onSubmit={onSubmit}
      />
      <Grid container justify="center" alignItems="center">
        <div ref={drop} className={classes.container}>
          <img className={classes.scriptImage} src={imgUrl} />
          {boxes[viewPageNo] &&
            Object.keys(boxes[viewPageNo]).map(key => {
              const { left, top, title, score } = boxes[viewPageNo][key];
              return (
                <>
                  <QuestionBox
                    key={key}
                    id={key}
                    left={left!}
                    top={top!}
                    score={score!}
                    title={title}
                    handleDelete={handleDelete(+key)}
                    initialValues={{
                      title: title,
                      score: score!,
                      pageCovered: ""
                    }}
                    pageCount={scriptTemplate.pageTemplates.length}
                    currentPage={viewPageNo}
                    onSubmit={onEditSubmit(+key)}
                  />
                </>
              );
            })}
          <IconButton
            className={classes.pageToggleLeft}
            onClick={decrementViewPageNo}
            disabled={viewPageNo === 1}
          >
            <BackIcon />
          </IconButton>
          <IconButton
            className={classes.pageToggleRight}
            onClick={incrementViewPageNo}
            disabled={viewPageNo === scriptTemplate.pageTemplates.length}
          >
            <ForwardIcon />
          </IconButton>
        </div>
      </Grid>
    </>
  );
};

export default QuestionContainer;
