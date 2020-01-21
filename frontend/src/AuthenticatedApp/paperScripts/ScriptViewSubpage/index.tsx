import {
  AppBar,
  Avatar,
  IconButton,
  Toolbar,
  Typography,
  Chip
} from "@material-ui/core";
import ArrowLeftIcon from "@material-ui/icons/ArrowBackIos";
import ArrowRightIcon from "@material-ui/icons/ArrowForwardIos";
import { PageViewData, ScriptDownloadData } from "backend/src/types/view";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api";
import { CanvasWithToolbar } from "../../../components/Canvas";
import { Point } from "../../../components/Canvas/types";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ReversedChip from "../../../components/ReversedChip";
import Header from "./Header";
import useStyles from "./styles";

const ScriptView: React.FC = () => {
  const classes = useStyles();
  const { scriptId } = useParams();

  const [isLoading, setLoading] = useState(true);
  const [script, setScript] = useState<ScriptDownloadData | null>(null);
  const [pages, setPages] = useState<Map<number, PageViewData>>(new Map());
  useEffect(() => {
    setLoading(true);
    if (isNaN(Number(scriptId))) {
      toast.error(`An invalid Script ID was provided.`);
      setLoading(false);
      setScript(null);
      return;
    }
    const downloadScript = async (scriptId: number) => {
      try {
        const response = await api.scripts.downloadScript(scriptId);
        const script = response.data.script;
        const pages = new Map<number, PageViewData>();
        script.pages.forEach(page => pages.set(page.pageNo, page));
        setPages(pages);
        setScript(script);
      } catch (error) {
        toast.error(
          `An error occured while viewing Script #${scriptId}. Please try refreshing the page.`
        );
      } finally {
        setLoading(false);
      }
    };
    downloadScript(Number(scriptId));
  }, [scriptId]);

  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1.0);
  const handleViewChange = (position: Point, scale: number) => {
    setPosition(position);
    setScale(scale);
  };

  const [pageNo, setPageNo] = useState(1);
  const incrementPageNo = () =>
    setPageNo(prevPageNo => Math.min(pages.size, prevPageNo + 1));
  const decrementPageNo = () =>
    setPageNo(prevPageNo => Math.max(1, prevPageNo - 1));

  if (isLoading) {
    return (
      <div className={classes.container}>
        <Header subtitle={`Loading Script #${scriptId}`} />
        <LoadingSpinner loadingMessage="Loading script..." />
      </div>
    );
  }

  if (!script) {
    return (
      <div className={classes.container}>
        <Header subtitle={`Error loading script ID ${scriptId}`} />
        <Typography variant="subtitle1">An error occurred.</Typography>
      </div>
    );
  }

  const { matriculationNumber, questions, filename } = script;
  const page = pages.get(pageNo);
  const totalMarks = questions
    .filter(question => question.score !== null)
    .map(question => question.score!)
    .reduce((accumulator, score) => accumulator + score, 0);
  const maxMarks = questions
    .map(question => question.maxScore)
    .reduce((accumulator, maxScore) => accumulator + maxScore, 0);

  return (
    <div className={classes.container}>
      <Header subtitle={matriculationNumber || filename} />
      <div className={classes.canvasWithToolbarContainer}>
        <div className={classes.grow}>
          <CanvasWithToolbar
            backgroundImageSource={page!.imageUrl}
            backgroundLinesArray={page!.annotations.map(
              annotation => annotation["layer"]
            )}
            foregroundLines={[]}
            onViewChange={handleViewChange}
          />
        </div>
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
      <AppBar position="fixed" color="inherit" className={classes.questionBar}>
        <Toolbar>
          <Typography variant="caption" className={classes.pageNumberDisplay}>
            Page {pageNo} of {pages.size}
          </Typography>
          <Typography variant="overline" className={classes.questionBarItem}>
            Total
          </Typography>
          <Chip
            label={`${totalMarks} / ${maxMarks}`}
            variant="outlined"
            className={classes.questionBarItem}
          />
          {questions.map(question => (
            <ReversedChip
              key={question.id}
              onClick={() => setPageNo(question.displayPage)}
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
      {pageNo !== pages.size && (
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
};

export default ScriptView;
