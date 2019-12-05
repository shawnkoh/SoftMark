import {
  AppBar,
  Avatar,
  Grid,
  IconButton,
  Toolbar,
  Typography
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowLeftIcon from "@material-ui/icons/ArrowBackIos";
import ArrowRightIcon from "@material-ui/icons/ArrowForwardIos";
import { ScriptViewData } from "backend/src/types/view";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../../api";
import { CanvasWithToolbar } from "../../../components/Canvas";
import { Point } from "../../../components/Canvas/types";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ReversedChip from "../../../components/ReversedChip";
import usePaper from "../../../contexts/PaperContext";
import useStyles from "./styles";

const ScriptView: React.FC = () => {
  const classes = useStyles();
  const paper = usePaper();
  const { scriptId } = useParams();

  const [scriptViewData, setScriptViewData] = useState<ScriptViewData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const getScriptViewData = async (scriptId: number) => {
    setIsLoading(true);
    const data = await api.scripts.viewScript(scriptId);
    setScriptViewData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    getScriptViewData(Number(scriptId));
  }, []);

  const [pageNo, setPageNo] = useState(1);

  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1.0);
  const handleViewChange = (position: Point, scale: number) => {
    setPosition(position);
    setScale(scale);
  };

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

    const { matriculationNumber, questions, pages, filename } = scriptViewData;

    return (
      <div className={classes.container}>
        <Header subtitle={matriculationNumber || filename} />
        <div className={classes.canvasWithToolbarContainer}>
          {pages
            .filter(page => page.pageNo === pageNo)
            .map((page, index) => (
              <div className={classes.grow} key={index}>
                <CanvasWithToolbar
                  backgroundImageSource={page.imageUrl}
                  backgroundAnnotations={page.annotations.map(
                    annotation => annotation["layer"]
                  )}
                  foregroundAnnotation={[]}
                  onViewChange={handleViewChange}
                />
              </div>
            ))}
          {questions
            .filter(question => question.displayPage === pageNo)
            .map((question, index) => (
              <ReversedChip
                key={index}
                label={"Q" + question.name}
                avatar={
                  <Avatar>{`${
                    question.score === null ? "-" : question.score
                  } / ${question.maxScore || "-"}`}</Avatar>
                }
                color={question.score === null ? "default" : "primary"}
                style={{
                  position: "absolute",
                  left: question.leftOffset * scale + position.x,
                  top: question.topOffset * scale + position.y
                }}
              />
            ))}
        </div>
        <AppBar
          position="fixed"
          color="inherit"
          className={classes.questionBar}
        >
          <Toolbar>
            <Typography variant="button" className={classes.questionBarItem}>
              {matriculationNumber || filename} Page {pageNo} of {pages.length}
            </Typography>
            {questions.map(question => (
              <ReversedChip
                key={question.id}
                avatar={
                  <Avatar>{`${
                    question.score === null ? "-" : question.score
                  } / ${question.maxScore || "-"}`}</Avatar>
                }
                label={"Q" + question.name}
                color={question.score === null ? "default" : "primary"}
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

export default ScriptView;
