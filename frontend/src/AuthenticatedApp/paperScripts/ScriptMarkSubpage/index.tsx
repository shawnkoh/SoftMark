import {
  AppBar,
  Button,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Typography
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowLeftIcon from "@material-ui/icons/ArrowBackIos";
import ArrowRightIcon from "@material-ui/icons/ArrowForwardIos";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { ScriptMarkingData } from "backend/src/types/view";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import api from "../../../api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import usePaper from "../../../contexts/PaperContext";
import Annotator from "../../paperGrading/MarkQuestionSubpage/Annotator";
import useStyles from "../../paperGrading/MarkQuestionSubpage/styles";

const ScriptMarkPage: React.FC = () => {
  const classes = useStyles();
  const paper = usePaper();
  const {
    scriptId: scriptIdString,
    questionTemplateId: questionTemplateIdString
  } = useParams();
  const scriptId = Number(scriptIdString);
  const questionTemplateId = Number(questionTemplateIdString);

  const [
    scriptMarkingData,
    setScriptMarkingData
  ] = useState<ScriptMarkingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [pageNo, setPageNo] = useState<number>(0);
  const [pageNos, setPageNos] = useState<number[]>([0]);

  const getScriptMarkingData = async (
    scriptId: number,
    questionTemplateId: number
  ) => {
    setIsLoading(true);
    const response = await api.scripts.markScript(scriptId, questionTemplateId);
    setScriptMarkingData(response.data);
    setIsLoading(false);
  };

  useEffect(() => {
    getScriptMarkingData(scriptId, questionTemplateId);
  }, [scriptId, questionTemplateId]);

  useEffect(() => {
    console.log(scriptMarkingData); // for debugging
    if (scriptMarkingData && scriptMarkingData.pages.length) {
      setPageNos(scriptMarkingData.pages.map(page => page.pageNo));
    }
  }, [scriptMarkingData]);

  useEffect(() => {
    if (pageNos.length) setPageNo(pageNos[0]);
  }, [pageNos]);

  const handlePrevClick = event => {
    if (scriptMarkingData) {
      const prevScriptId = scriptMarkingData.previousScriptId;
      if (prevScriptId) {
        getScriptMarkingData(prevScriptId, questionTemplateId);
      }
    }
  };

  const handleNextClick = event => {
    if (scriptMarkingData) {
      const nextScriptId = scriptMarkingData.nextScriptId;
      if (nextScriptId) {
        getScriptMarkingData(nextScriptId, questionTemplateId);
      }
    }
  };

  interface HeaderProps {
    subtitle: string;
  }
  const Header: React.FC<HeaderProps> = props => (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <IconButton
          color="inherit"
          component={Link}
          to={`/papers/${paper.id}/grading`}
          className={classes.backButton}
        >
          <ArrowBackIcon />
        </IconButton>
        <Grid container className={classes.grow}>
          <Grid item xs={12}>
            <Typography variant="h6">{paper.name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">{props.subtitle}</Typography>
          </Grid>
        </Grid>
        {scriptMarkingData && (
          <>
            <Typography variant="subtitle1" className={classes.text}>
              {scriptMarkingData.matriculationNumber ||
                `Unmatched script ${scriptMarkingData.filename}`}
            </Typography>
            <Typography variant="subtitle1" className={classes.text}>
              ID: {scriptMarkingData.id}
            </Typography>
          </>
        )}
        <Button
          color="inherit"
          disabled={!(scriptMarkingData && scriptMarkingData.previousScriptId)}
          onClick={handlePrevClick}
          startIcon={<NavigateBeforeIcon />}
          className={classes.button}
        >
          Previous
        </Button>
        <Button
          color="inherit"
          disabled={!(scriptMarkingData && scriptMarkingData.nextScriptId)}
          onClick={handleNextClick}
          startIcon={<NavigateNextIcon />}
          className={classes.button}
        >
          Next
        </Button>
      </Toolbar>
    </AppBar>
  );

  if (isLoading) {
    return (
      <div className={classes.container}>
        <Header
          subtitle={`Marking script ID ${scriptId} question template ID ${questionTemplateId}`}
        />
        <LoadingSpinner loadingMessage="Loading script..." />
      </div>
    );
  }

  if (scriptMarkingData) {
    const {
      matriculationNumber,
      rootQuestionTemplate,
      questions,
      pages,
      canMark,
      filename
    } = scriptMarkingData;

    if (!canMark) {
      return (
        <div className={classes.container}>
          <Header
            subtitle={`Marking script ID ${scriptId} Q${rootQuestionTemplate.name}`}
          />
          <Container maxWidth={false} className={classes.innerContainer}>
            <Typography variant="subtitle1">
              Cannot mark this script. Someone else may be marking it now. Try
              another script.
            </Typography>
          </Container>
        </div>
      );
    }

    if (!pages) {
      return (
        <div className={classes.container}>
          <Header
            subtitle={`Marking script ID ${scriptId} Q${rootQuestionTemplate.name}`}
          />
          <Container maxWidth={false} className={classes.innerContainer}>
            <Typography variant="subtitle1">
              No pages to display for this script.
            </Typography>
          </Container>
        </div>
      );
    }

    const lastPageNo = pageNos[pageNos.length - 1];
    const firstPageNo = pageNos[0];
    const incrementPageNo = () =>
      setPageNo(prevPageNo => {
        const nextPageNo = pageNos[pageNos.indexOf(prevPageNo) + 1];
        return Math.min(lastPageNo, isNaN(nextPageNo) ? Infinity : nextPageNo);
      });
    const decrementPageNo = () =>
      setPageNo(prevPageNo => {
        const nextPageNo = pageNos[pageNos.indexOf(prevPageNo) - 1];
        return Math.max(
          firstPageNo,
          isNaN(nextPageNo) ? -Infinity : nextPageNo
        );
      });

    const getCurrentPageQuestions = (currentPageNo: number) => {
      const currentPage = pages.find(page => page.pageNo === currentPageNo)!;
      const currentPageQuestions = questions.filter(question =>
        currentPage.questionIds.includes(question.id)
      );
      return currentPageQuestions;
    };

    return (
      <div className={classes.container}>
        <Header
          subtitle={`Marking ${matriculationNumber ||
            "unmatched script " + filename} Q${rootQuestionTemplate.name}`}
        />
        {pages
          .filter(page => page.pageNo === pageNo)
          .map((page, index) => {
            return (
              <Annotator
                // TODO: Stringifying the questions is a quick hack to work around the shallow check behaviour of react
                // The more ideal solution is to abstract the questions into its own component and pass the flattened data as props
                key={page.id + JSON.stringify(questions)}
                page={page}
                questions={getCurrentPageQuestions(page.pageNo)}
                rootQuestionTemplate={rootQuestionTemplate}
              />
            );
          })}
        {pageNo !== pageNos[0] && (
          <IconButton
            onClick={decrementPageNo}
            className={classes.prevPageButton}
            color="inherit"
            aria-label="previous page"
          >
            <ArrowLeftIcon />
          </IconButton>
        )}
        {pageNo !== pageNos[pageNos.length - 1] && (
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
      <Header
        subtitle={`Marking script ID ${scriptId} question template ID ${questionTemplateId}`}
      />
      <Container maxWidth={false} className={classes.innerContainer}>
        <Typography variant="subtitle1">An error occurred.</Typography>
      </Container>
    </div>
  );
};

export default ScriptMarkPage;
