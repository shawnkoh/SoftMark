import {
  AppBar,
  Container,
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
import LoadingSpinner from "../../../components/LoadingSpinner";
import usePaper from "../../../contexts/PaperContext";
import Annotator from "./Annotator";
import useStyles from "./styles";

const ScriptEdit: React.FC = () => {
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
            <Typography variant="h6" noWrap={false}>{paper.name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" noWrap>{subtitle}</Typography>
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
    console.log(scriptViewData); // for debugging

    const {
      matriculationNumber,
      rootQuestionTemplate,
      questions,
      pages,
      filename
    } = scriptViewData;

    if (!pages) {
      return (
        <div className={classes.container}>
          <Header subtitle={`Marking Q${rootQuestionTemplate.name}`} />
          <Container maxWidth={false} className={classes.innerContainer}>
            <Typography variant="subtitle1">No pages to display.</Typography>
          </Container>
        </div>
      );
    }

    const incrementPageNo = () =>
      setPageNo(prevPageNo => Math.min(pages.length, prevPageNo + 1));
    const decrementPageNo = () =>
      setPageNo(prevPageNo => Math.max(1, prevPageNo - 1));

    const getCurrentPageQuestions = () => {
      const currentPage = pages.find(page => page.pageNo === pageNo)!;
      const currentPageQuestions = questions.filter(question =>
        currentPage.questionIds.includes(question.id)
      );
      return currentPageQuestions;
    };

    return (
      <div className={classes.container}>
        <Header
          subtitle={
            matriculationNumber
              ? `Marking script of ${matriculationNumber}`
              : `Marking unmatched script ${filename}`
          }
        />
        {pages
          .filter(page => page.pageNo === pageNo)
          .map((page, index) => (
            <div className={classes.grow} key={index}>
              <Annotator
                key={page.id}
                page={page}
                questions={getCurrentPageQuestions()}
                rootQuestionTemplate={rootQuestionTemplate}
                matriculationNumber={matriculationNumber}
              />
            </div>
          ))}
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

export default ScriptEdit;
