import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";

import api from "../../../api";
import usePaper from "../../../contexts/PaperContext";
import { ScriptViewData } from "backend/src/types/view";

import {
  Grid,
  Button,
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Avatar,
  Chip
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowLeftIcon from "@material-ui/icons/ArrowBackIos";
import ArrowRightIcon from "@material-ui/icons/ArrowForwardIos";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { lightBlue } from "@material-ui/core/colors";

import { CanvasWithToolbar } from "../../../components/Canvas";
import LoadingSpinner from "../../../components/LoadingSpinner";

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
    },
    questionBar: {
      backgroundColor: lightBlue[50],
      top: "auto",
      bottom: 0
    },
    questionBarItem: {
      marginRight: theme.spacing(1)
    }
  })
);

type Props = RouteComponentProps;

const ScriptView: React.FC<Props> = ({ match: { params } }) => {
  const classes = useStyles();
  const paper = usePaper();

  const scriptId = parseInt((params as { scriptId: string }).scriptId, 10);

  const [scriptViewData, setScriptViewData] = useState<ScriptViewData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

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

  const Header = () => (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <IconButton
          color="inherit"
          component={Link}
          to="/papers"
          className={classes.backButton}
        >
          <ArrowBackIcon />
        </IconButton>
        <Grid container className={classes.grow}>
          <Grid item xs={12}>
            <Typography variant="h6">{paper.name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">{`Viewing script ID ${scriptId}`}</Typography>
          </Grid>
        </Grid>
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
      setPageNo(prevPageNo => Math.max(1, prevPageNo - 1));

    const {
      matriculationNumber,
      rootQuestion,
      descendantQuestions,
      pages
    } = scriptViewData;

    const getCurrentPageQuestions = () => {
      const currentPage = pages.find(page => page.pageNo === pageNo)!;
      const currentPageQuestions =
        descendantQuestions === undefined ||
        descendantQuestions === null ||
        descendantQuestions.length == 0
          ? [rootQuestion]
          : descendantQuestions.filter(question =>
              currentPage.questionIds.includes(question.id)
            );
      return currentPageQuestions;
    };

    return (
      <div className={classes.container}>
        <Header />
        {pages.map((page, index) => {
          return (
            <div className={classes.grow}>
              {page.pageNo === pageNo && (
                <CanvasWithToolbar
                  key={page.id}
                  backgroundImageSource={page.imageUrl}
                  backgroundAnnotations={page.annotations.map(
                    annotation => annotation["layer"]
                  )}
                />
              )}
            </div>
          );
        })}
        <AppBar
          position="fixed"
          color="inherit"
          className={classes.questionBar}
        >
          <Toolbar>
            <Typography variant="button" className={classes.questionBarItem}>
              {matriculationNumber} Page {pageNo} of {pages.length}
            </Typography>
            {getCurrentPageQuestions().map(question => (
              <Chip
                key={question.id}
                avatar={<Avatar>{question.score || "-"}</Avatar>}
                label={question.name}
                color={question.score ? "primary" : "inherit"}
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
      <Header />
      <Typography variant="subtitle1">An error occurred.</Typography>
    </div>
  );
};

export default withRouter(ScriptView);
