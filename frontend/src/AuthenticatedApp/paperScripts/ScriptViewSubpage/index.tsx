import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";

import api from "../../../api";
import usePaper from "../../../contexts/PaperContext";
import { ScriptViewData } from "backend/src/types/view";

import {
  Grid,
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Avatar
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowLeftIcon from "@material-ui/icons/ArrowBackIos";
import ArrowRightIcon from "@material-ui/icons/ArrowForwardIos";

import { CanvasWithToolbar } from "../../../components/Canvas";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ReversedChip from "../../../components/ReversedChip";

import useStyles from "./styles";

type Props = RouteComponentProps;

const ScriptView: React.FC<Props> = ({ match }) => {
  const classes = useStyles();
  const paper = usePaper();

  const scriptId = parseInt(
    (match.params as { scriptId: string }).scriptId,
    10
  );

  const [scriptViewData, setScriptViewData] = useState<ScriptViewData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const getScriptViewData = async (scriptId: number) => {
    setIsLoading(true);
    const data = await api.scripts.viewScript(scriptId);
    setScriptViewData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    getScriptViewData(scriptId);
  }, [refreshFlag]);

  const [pageNo, setPageNo] = useState(1);

  interface HeaderProps {
    subtitle: string;
  }
  const Header: React.FC<HeaderProps> = ({ subtitle }) => (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <IconButton
          color="inherit"
          component={Link}
          to={`/papers/${paper.id}/scripts`}
          className={classes.backButton}
        >
          <ArrowBackIcon />
        </IconButton>
        <Grid container className={classes.grow}>
          <Grid item xs={12}>
            <Typography variant="h6">{paper.name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">{subtitle}</Typography>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );

  if (isLoading) {
    return (
      <div className={classes.container}>
        <Header subtitle={`Loading script ID ${scriptId}`} />
        <LoadingSpinner loadingMessage="Loading script..." />
      </div>
    );
  }

  if (scriptViewData) {
    const incrementPageNo = () =>
      setPageNo(prevPageNo => Math.min(pages.length, prevPageNo + 1));
    const decrementPageNo = () =>
      setPageNo(prevPageNo => Math.max(1, prevPageNo - 1));

    console.log(scriptViewData); // for debugging

    const {
      matriculationNumber,
      rootQuestionTemplate,
      questions,
      pages
    } = scriptViewData;

    /*
    const getCurrentPageQuestions = () => {
      const currentPage = pages.find(page => page.pageNo === pageNo)!;
      const currentPageQuestions = questions.filter(question =>
        currentPage.questionIds.includes(question.id)
      );
      return currentPageQuestions;
    };
    */

    return (
      <div className={classes.container}>
        <Header
          subtitle={
            matriculationNumber
              ? `Viewing script of ${matriculationNumber}`
              : `Viewing unmatched script ID ${scriptId}`
          }
        />
        {pages
          .filter(page => page.pageNo === pageNo)
          .map((page, index) => (
            <div className={classes.grow} key={index}>
              <CanvasWithToolbar
                backgroundImageSource={page.imageUrl}
                backgroundAnnotations={page.annotations.map(
                  annotation => annotation["layer"]
                )}
              />
            </div>
          ))}
        <AppBar
          position="fixed"
          color="inherit"
          className={classes.questionBar}
        >
          <Toolbar>
            <Typography variant="button" className={classes.questionBarItem}>
              {matriculationNumber || "(Unmatched script)"} Page {pageNo} of{" "}
              {pages.length}
            </Typography>
            {questions.map(question => (
              <ReversedChip
                key={question.id}
                avatar={
                  <Avatar>
                    {`${question.score || "-"} / ${question.maxScore || "-"}`}
                  </Avatar>
                }
                label={"Q" + question.name}
                color={question.score ? "primary" : "default"}
                className={classes.questionBarItem}
              />
            ))}
          </Toolbar>
        </AppBar>
        {pageNo !== 1 && (
          <IconButton
            onClick={decrementPageNo}
            className={classes.prevPageButton}
            color="inherit"
            aria-label="previous page"
          >
            <ArrowLeftIcon />
          </IconButton>
        )}
        {pageNo !== pages.length && (
          <IconButton
            onClick={incrementPageNo}
            className={classes.nextPageButton}
            color="inherit"
            aria-label="next page"
          >
            <ArrowRightIcon />
          </IconButton>
        )}
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <Header subtitle={`Error loading script ID ${scriptId}`} />
      <Typography variant="subtitle1">An error occurred.</Typography>
    </div>
  );
};

export default withRouter(ScriptView);
