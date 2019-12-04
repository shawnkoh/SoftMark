import { Container, IconButton, Typography } from "@material-ui/core";
import ArrowLeftIcon from "@material-ui/icons/ArrowBackIos";
import ArrowRightIcon from "@material-ui/icons/ArrowForwardIos";
import LoadingSpinner from "components/LoadingSpinner";
import React from "react";
import AnnotatorTwo from "./AnnotatorTwo";
import Header from "./Header";
import useMarkQuestion, { MarkQuestionProvider } from "./MarkQuestionContext";
import useStyles from "./styles";

const MarkQuestionPage: React.FC = () => {
  const classes = useStyles();
  const {
    isLoading,
    scriptMarkingData,
    currentPageIdx,
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
      <AnnotatorTwo page={pages[currentPageIdx]} />
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
