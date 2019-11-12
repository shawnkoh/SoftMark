import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../../api";
import {
  QuestionViewData,
  AnnotationViewData,
  PageViewData,
  ScriptViewData
} from "backend/src/types/view";

import { AppBar, IconButton, Toolbar, Typography } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import TogglePageComponent from "../../../components/misc/TogglePageComponent";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Annotator from "./Annotator";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      minHeight: "100vh",
      minWidth: "100vw",
      display: "flex",
      flexDirection: "column"
    },
    grow: {
      display: "flex",
      flexGrow: 1
    }
  })
);

type Props = RouteComponentProps;

const MarkQuestionPage: React.FC<Props> = ({ match }) => {
  const classes = useStyles();

  const questionId = (match.params as { questionId: string }).questionId;
  const [script, setScript] = useState<ScriptViewData | null>(null);

  const [viewPageNo, setViewPageNo] = useState(1);
  const incrementViewPageNo = () => setViewPageNo(viewPageNo + 1);
  const decrementViewPageNo = () => setViewPageNo(viewPageNo - 1);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  if (isLoading) {
    return (
      <>
        <LoadingSpinner />
        Loading script...
      </>
    );
  }

  if (!script) {
    return <>The script does not exist</>;
  }

  return (
    <div className={classes.container}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <IconButton color="inherit">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Placeholder Title</Typography>
        </Toolbar>
      </AppBar>
      <div>
        <TogglePageComponent
          pageNo={viewPageNo}
          incrementPageNo={incrementViewPageNo}
          decrementPageNo={decrementViewPageNo}
        />
      </div>
      {script.pages.map((page, index) => {
        return (
          <div className={classes.grow}>
            {page.pageNo === viewPageNo && (
              <Annotator
                key={page.id}
                pageId={page.id}
                backgroundImageSource={page.imageUrl}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default withRouter(MarkQuestionPage);
