import { Box, Fab, IconButton, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import BackIcon from "@material-ui/icons/ArrowBackIos";
import ForwardIcon from "@material-ui/icons/ArrowForwardIos";
import { PageTemplateListData } from "backend/src/types/pageTemplates";
import {
  QuestionTemplateData,
  QuestionTemplateTreeData
} from "backend/src/types/questionTemplates";
import update from "immutability-helper";
import React, { useState } from "react";
import { useDrop, XYCoord } from "react-dnd";
import api from "../../../api";
import QuestionTemplateDialog from "../ScriptTemplateView/QuestionTemplateDialog";
import ScriptTemplateQuestion from "../ScriptTemplateQuestion";
import useStyles from "./useStyles";

type DragItem = QuestionTemplateData & { type: string; index: number };

interface OwnProps {
  questionTemplateTrees: QuestionTemplateTreeData[];
  currentPageNo: number;
  pageCount: number;
  nextPage: (e?: any) => void;
  prevPage: (e?: any) => void;
  questionTemplates: QuestionTemplateData[];
  pageTemplate: PageTemplateListData;
}

type Props = OwnProps;

const ScriptTemplatePanel: React.FC<Props> = props => {
  const classes = useStyles();
  const {
    questionTemplateTrees,
    questionTemplates,
    pageTemplate,
    currentPageNo,
    pageCount,
    nextPage,
    prevPage
  } = props;

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [boxes, setBoxes] = useState<QuestionTemplateData[]>(questionTemplates);

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
      hidden={pageTemplate.pageNo !== currentPageNo}
    >
      <QuestionTemplateDialog
        questionTemplateTrees={questionTemplateTrees}
        mode="create"
        scriptTemplateId={pageTemplate.scriptTemplateId}
        open={openEditDialog}
        handleClose={() => setOpenEditDialog(false)}
        pageCount={pageCount}
        currentPageNo={currentPageNo}
        onSuccess={qTemplate => {
          // TODO: @Jian Xi - not sure if this change is ok - please check
          update(boxes, {
            $push: [qTemplate]
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
              questionTemplateTrees={questionTemplateTrees}
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
