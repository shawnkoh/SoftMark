import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import usePaper from "contexts/PaperContext";
import useMarkQuestion from "./MarkQuestionContext";

import useStyles from "./styles";
import {
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  Typography,
  Button,
  Container,
  Hidden
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowLeftIcon from "@material-ui/icons/ArrowBackIos";
import ArrowRightIcon from "@material-ui/icons/ArrowForwardIos";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";

import { MarkQuestionProvider } from "./MarkQuestionContext";
import LoadingSpinner from "components/LoadingSpinner";
import AnnotatorTwo from "./AnnotatorTwo";

const MarkQuestionPage: React.FC = () => {
  const classes = useStyles();
  const {
    isLoading,
    scriptMarkingData,
    foregroundAnnotation,
    currentPageIdx,
    currentQns,
    decrementPageNo,
    incrementPageNo
  } = useMarkQuestion();
  const {
    matriculationNumber,
    rootQuestionTemplate,
    pages,
    canMark
  } = scriptMarkingData;

  if (isLoading) {
    return <LoadingSpinner loadingMessage="Loading script..." />;
  }

  if (!canMark) {
    return (
      <Container maxWidth={false} className={classes.innerContainer}>
        <Typography variant="subtitle1">
          Cannot mark this script. Someone else may be marking it now. Try
          another script.
        </Typography>
      </Container>
    );
  }

  if (!pages) {
    return (
      <Container maxWidth={false} className={classes.innerContainer}>
        <Typography variant="subtitle1">
          No pages to display for this script.
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <AnnotatorTwo
        // TODO: Stringifying the questions is a quick hack to work around the shallow check behaviour of react
        // The more ideal solution is to abstract the questions into its own component and pass the flattened data as props
        page={pages[currentPageIdx]}
        foregroundAnnotation={foregroundAnnotation}
        questions={currentQns}
        rootQuestionTemplate={rootQuestionTemplate}
        matriculationNumber={matriculationNumber}
      />
      {currentPageIdx > 0 && (
        <IconButton
          onClick={decrementPageNo}
          className={classes.prevPageButton}
          color="inherit"
          aria-label="previous page"
        >
          <ArrowLeftIcon />
        </IconButton>
      )}
      {currentPageIdx < pages.length - 1 && (
        <IconButton
          onClick={incrementPageNo}
          className={classes.nextPageButton}
          color="inherit"
          aria-label="next page"
        >
          <ArrowRightIcon />
        </IconButton>
      )}
    </>
  );
};

const Header: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const paper = usePaper();
  const {
    scriptMarkingData,
    handlePrevClick,
    handleNextClick,
    handleNextUnmarkedClick
  } = useMarkQuestion();
  const { rootQuestionTemplate } = scriptMarkingData;
  return (
    <AppBar position="static" color="primary" elevation={1}>
    <Toolbar className={matches ? undefined : classes.flexWrap}>
      <IconButton
        color="inherit"
        component={Link}
        to={`/papers/${paper.id}/grading`}
        className={classes.backButton}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h6" className={classes.grow}>
        {`Q${rootQuestionTemplate.name}`}
      </Typography>
      {scriptMarkingData && (
        <>
          <Typography variant="subtitle1" className={classes.text}>
            {scriptMarkingData.matriculationNumber ||
              scriptMarkingData.filename}
          </Typography>
          <Typography variant="subtitle1" className={classes.text}>
            ID: {scriptMarkingData.id}
          </Typography>
        </>
      )}
      <Hidden lgUp>
        <IconButton
          color="inherit"
          disabled={
            !(scriptMarkingData && scriptMarkingData.previousScriptId)
          }
          onClick={handlePrevClick}
          className={classes.button}
        >
          <NavigateBeforeIcon />
        </IconButton>
      </Hidden>
      <Hidden mdDown>
        <Button
          color="inherit"
          disabled={
            !(scriptMarkingData && scriptMarkingData.previousScriptId)
          }
          onClick={handlePrevClick}
          startIcon={<NavigateBeforeIcon />}
          className={classes.button}
        >
          Previous
        </Button>
      </Hidden>
      <Hidden lgUp>
        <IconButton
          color="inherit"
          disabled={!(scriptMarkingData && scriptMarkingData.nextScriptId)}
          onClick={handleNextClick}
        >
          <NavigateNextIcon />
        </IconButton>
      </Hidden>
      <Hidden mdDown>
        <Button
          color="inherit"
          disabled={!(scriptMarkingData && scriptMarkingData.nextScriptId)}
          onClick={handleNextClick}
          startIcon={<NavigateNextIcon />}
          className={classes.button}
        >
          Next
        </Button>
      </Hidden>
      <Hidden mdUp>
        <IconButton color="inherit" onClick={handleNextUnmarkedClick}>
          <SkipNextIcon />
        </IconButton>
      </Hidden>
      <Hidden smDown>
        <Button
          color="inherit"
          variant="outlined"
          onClick={handleNextUnmarkedClick}
          startIcon={<SkipNextIcon />}
          className={classes.button}
        >
          Next Unmarked
        </Button>
      </Hidden>
    </Toolbar>
  </AppBar>
  );
};

const MarkQuestionPageWrapper: React.FC = () => {
  const classes = useStyles();
  return (
    <MarkQuestionProvider>
      <div className={classes.container}>
        <Header />
        <MarkQuestionPage />
      </div>
    </MarkQuestionProvider>
  );
};

export default MarkQuestionPageWrapper;
