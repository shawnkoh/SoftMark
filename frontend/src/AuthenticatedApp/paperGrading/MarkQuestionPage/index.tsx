import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";

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
import ArrowLeftIcon from "@material-ui/icons/ArrowBackIos";
import ArrowRightIcon from "@material-ui/icons/ArrowForwardIos";
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
    },
    backButton: {
      marginRight: theme.spacing(2)
    },
    prevPageButton: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      margin: "auto"
    },
    nextPageButton: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      margin: "auto"
    },
    pageLabel: {
      position: "absolute",
      bottom: theme.spacing(10),
      left: 0,
      right: 0,
      margin: "0 auto"
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
        <IconButton
          color="inherit"
          component={Link}
          to={`/papers/${paper.id}/setup`}
          className={classes.backButton}
        >
          <ArrowBackIcon />
        </IconButton>
        <Grid container className={classes.grow}>
          <Grid item xs={12}>
            <Typography variant="h6">{paper.name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">{`Marking question template ID ${questionTemplateId}`}</Typography>
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
        <IconButton
          onClick={decrementPageNo}
          className={classes.prevPageButton}
          color="inherit"
          aria-label="previous page"
        >
          <ArrowLeftIcon />
        </IconButton>
        <Typography
          variant="button"
          gutterBottom
          align="center"
          color="primary"
          className={classes.pageLabel}
        >
          {`Page ${pageNo} of ${pages.length}`}
        </Typography>
        <IconButton
          onClick={incrementPageNo}
          className={classes.nextPageButton}
          color="inherit"
          aria-label="next page"
        >
          <ArrowRightIcon />
        </IconButton>
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
