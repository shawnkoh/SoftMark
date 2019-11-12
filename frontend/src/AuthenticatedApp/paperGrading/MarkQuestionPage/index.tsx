import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../../api";
import usePaper from "../../../contexts/PaperContext";
import {
  QuestionViewData,
  AnnotationViewData,
  PageViewData,
  ScriptViewData
} from "backend/src/types/view";

import {
  Grid,
  AppBar,
  Button,
  IconButton,
  Toolbar,
  Typography
} from "@material-ui/core";
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
  const paper = usePaper();

  const questionTemplateId = parseInt(
    (match.params as { questionTemplateId: string }).questionTemplateId,
    10
  );

  const [scriptViewData, setScriptViewData] = useState<ScriptViewData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  useEffect(() => {
    const getScriptViewData = async (questionTemplateId: number) => {
      setIsLoading(true);
      const data = await api.questionTemplates.getQuestionToMark(
        questionTemplateId
      );
      setScriptViewData(data);
      setIsLoading(false);
    };
    getScriptViewData(questionTemplateId);
  }, [refreshFlag]);

  const [pageNo, setPageNo] = useState(1);

  const Header = () => (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <IconButton color="inherit">
          <ArrowBackIcon />
        </IconButton>
        <Grid container className={classes.grow}>
          <Grid item xs={12}>
            <Typography variant="h6">{paper.name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">{`Marking question ID ${questionTemplateId}`}</Typography>
          </Grid>
        </Grid>
        <Button color="inherit" onClick={toggleRefreshFlag}>
          Next Script
        </Button>
      </Toolbar>
    </AppBar>
  );

  if (isLoading) {
    return (
      <div className={classes.container}>
        <Header />
        <LoadingSpinner loadingMessage="Loading script..." />
      </div>
    );
  }

  if (scriptViewData) {
    console.log(scriptViewData);

    const incrementPageNo = () =>
      setPageNo(prevPageNo => Math.min(pages.length, prevPageNo + 1));
    const decrementPageNo = () =>
      setPageNo(prevPageNo => Math.max(0, prevPageNo - 1));

    const {
      matriculationNumber,
      rootQuestion,
      descendantQuestions,
      pages
    } = scriptViewData;

    return (
      <div className={classes.container}>
        <Header />
        <div>
          <TogglePageComponent
            pageNo={pageNo}
            incrementPageNo={incrementPageNo}
            decrementPageNo={decrementPageNo}
          />
        </div>
        {pages
          .filter(page => page.pageNo === pageNo)
          .map(page => (
            <div className={classes.grow}>
              {page.pageNo === pageNo && (
                <Annotator
                  key={page.id}
                  pageId={page.id}
                  backgroundImageSource={page.imageUrl}
                  foregroundAnnotation={
                    page.annotations.length > 0 ? page.annotations[0].layer : []
                  }
                />
              )}
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <Header />
      <Typography variant="subtitle1">The script does not exist.</Typography>
    </div>
  );
};

export default MarkQuestionPage;
