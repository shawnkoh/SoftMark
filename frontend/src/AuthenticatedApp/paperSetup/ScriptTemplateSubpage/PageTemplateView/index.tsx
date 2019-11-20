import { Box, Fab, IconButton, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import BackIcon from "@material-ui/icons/ArrowBackIos";
import ForwardIcon from "@material-ui/icons/ArrowForwardIos";
import { PageTemplateSetupData } from "backend/src/types/pageTemplates";
import { QuestionTemplateLeafData } from "backend/src/types/questionTemplates";
import React, { useState } from "react";
import { useDrop, XYCoord } from "react-dnd";
import api from "../../../../api";
import QuestionTemplateDialog from "../ScriptTemplateView/QuestionTemplateDialog";
import ScriptTemplateQuestion from "../ScriptTemplateGradebox";
import useStyles from "./useStyles";
import useScriptSetup from "AuthenticatedApp/paperSetup/context/ScriptSetupContext";
import { toast } from "react-toastify";

export type DragItem = QuestionTemplateLeafData & { type: string; index: number };

const PageTemplateView: React.FC<{
  pageTemplate: PageTemplateSetupData;
}> = props => {
  const classes = useStyles();
  const { pageTemplate } = props;
  const { currentPageNo, pageCount, goPage, refresh } = useScriptSetup();

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [, drop] = useDrop({
    accept: "questionBox",
    async drop(item: DragItem, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
      const leftOffset = Math.round(item.leftOffset! + delta.x);
      const topOffset = Math.round(item.topOffset! + delta.y);
      
      api.questionTemplates.editQuestionTemplate(item.id, {
          topOffset,
          leftOffset
        }).then(() => { 
          refresh();
          toast.success(`${item.name}'s position successfully updated`);
        }).catch(() => {
          toast.error(`Failed to move ${item.name}`);
        });
      return undefined;
    }
  });

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={pageTemplate.pageNo !== currentPageNo}
    >
      <QuestionTemplateDialog
        mode="create"
        open={openEditDialog}
        handleClose={() => setOpenEditDialog(false)}
      />
      <Fab
        onClick={() => setOpenEditDialog(true)}
        color="primary"
        className={classes.addFab}
      >
        <AddIcon />
      </Fab>
      <Box p={0} display="flex" justifyContent="center" alignItems="center">
        <IconButton
          onClick={() => goPage(currentPageNo - 1)}
          disabled={currentPageNo === 1}
        >
          <BackIcon />
        </IconButton>
        <div ref={drop} className={classes.container}>
          <img className={classes.scriptImage} src={pageTemplate.imageUrl} />
          {pageTemplate.questionTemplates
            .filter(q => q.displayPage === currentPageNo)
            .map((questionTemplate, index) => (
              <ScriptTemplateQuestion
                key={questionTemplate.id}
                index={index}
                questionTemplate={questionTemplate}
              />
            ))}
        </div>
        <IconButton
          onClick={() => goPage(currentPageNo + 1)}
          disabled={currentPageNo === pageCount}
        >
          <ForwardIcon />
        </IconButton>
      </Box>
    </Typography>
  );
};

export default PageTemplateView;
