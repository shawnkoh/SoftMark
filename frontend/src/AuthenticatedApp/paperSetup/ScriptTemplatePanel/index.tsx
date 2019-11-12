import { Box, Fab, IconButton, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import BackIcon from "@material-ui/icons/ArrowBackIos";
import ForwardIcon from "@material-ui/icons/ArrowForwardIos";
import { PageTemplateListData } from "backend/src/types/pageTemplates";
import { QuestionTemplateListData } from "backend/src/types/questionTemplates";
import update from "immutability-helper";
import React, { useState } from "react";
import { useDrop, XYCoord } from "react-dnd";
import api from "../../../api";
import QuestionTemplateDialog from "../components/QuestionTemplateDialog";
import ScriptTemplateQuestion from "../ScriptTemplateQuestion";
import useStyles from "./useStyles";

type DragItem = QuestionTemplateListData & { type: string; index: number };

interface OwnProps {
  currentPageNo: number;
  pageCount: number;
  nextPage: (e?: any) => void;
  prevPage: (e?: any) => void;
  questionTemplates: QuestionTemplateListData[];
  pageTemplate: PageTemplateListData;
}

type Props = OwnProps;

const ScriptTemplatePanel: React.FC<Props> = props => {
  const classes = useStyles();
  const {
    questionTemplates,
    pageTemplate,
    currentPageNo,
    pageCount,
    nextPage,
    prevPage
  } = props;

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [boxes, setBoxes] = useState<QuestionTemplateListData[]>(
    questionTemplates
  );

  const [, drop] = useDrop({
    accept: "questionBox",
    drop(item: DragItem, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
      const leftOffset = Math.round(item.leftOffset! + delta.x);
      const topOffset = Math.round(item.topOffset! + delta.y);
      api.questionTemplates
        .editQuestionTemplate(item.id, {
          topOffset,
          leftOffset
        })
        .then(
          resp =>
            resp.status === 200 && moveBox(item.index, leftOffset, topOffset)
        );
      return undefined;
    }
  });
  const moveBox = (index: number, leftOffset: number, topOffset: number) => {
    setBoxes(update(boxes, { [index]: { $merge: { topOffset, leftOffset } } }));
  };

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={pageTemplate.id !== currentPageNo}
    >
      <QuestionTemplateDialog
        mode="create"
        scriptTemplateId={pageTemplate.scriptTemplateId}
        open={openEditDialog}
        handleClose={() => setOpenEditDialog(false)}
        pageCount={pageCount}
        currentPageNo={currentPageNo}
        onSuccess={qTemplate => {
          update(boxes, {
            $push: [
              {
                id: qTemplate.id,
                createdAt: qTemplate.createdAt,
                updatedAt: qTemplate.updatedAt,
                discardedAt: qTemplate.discardedAt,
                scriptTemplateId: qTemplate.id,
                name: qTemplate.name,
                score: qTemplate.score,
                parentQuestionTemplateId: qTemplate.parentQuestionTemplateId,
                topOffset: qTemplate.topOffset,
                leftOffset: qTemplate.leftOffset
              }
            ]
          });
        }}
      />
      <Fab
        onClick={() => setOpenEditDialog(true)}
        color="primary"
        className={classes.addFab}
      >
        <AddIcon />
      </Fab>
      <Box p={0} display="flex" justifyContent="center" alignItems="center">
        <IconButton onClick={prevPage} disabled={currentPageNo === 1}>
          <BackIcon />
        </IconButton>
        <div ref={drop} className={classes.container}>
          <img className={classes.scriptImage} src={pageTemplate.imageUrl} />
          {boxes.map((questionTemplate, index) => (
            <ScriptTemplateQuestion
              key={questionTemplate.id}
              index={index}
              questionTemplate={questionTemplate}
              currentPageNo={currentPageNo}
              pageCount={pageCount}
              onEditSuccess={qTemplate =>
                setBoxes([
                  ...boxes.map(box =>
                    qTemplate.id === box.id ? qTemplate : box
                  )
                ])
              }
            />
          ))}
        </div>
        <IconButton onClick={nextPage} disabled={currentPageNo === pageCount}>
          <ForwardIcon />
        </IconButton>
      </Box>
    </Typography>
  );
};

export default ScriptTemplatePanel;
