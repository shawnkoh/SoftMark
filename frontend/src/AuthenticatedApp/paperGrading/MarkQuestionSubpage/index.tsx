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
import { ScriptViewData } from "backend/src/types/view";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import api from "../../../api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import usePaper from "../../../contexts/PaperContext";
import Annotator from "./Annotator";
import useStyles from "./styles";

const MarkQuestionPage: React.FC = () => {
  const classes = useStyles();
  const paper = usePaper();
  const { questionTemplateId } = useParams();

  const [scriptViewData, setScriptViewData] = useState<ScriptViewData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  const [pageNo, setPageNo] = useState<number>(0);
  const [pageNos, setPageNos] = useState<number[]>([0]);

  const getScriptViewData = async (questionTemplateId: number) => {
    setIsLoading(true);
    const data = await api.questionTemplates.getQuestionToMark(
      questionTemplateId
    );
    setScriptViewData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    getScriptViewData(Number(questionTemplateId));
  }, [refreshFlag]);

  useEffect(() => {
    if (scriptViewData && scriptViewData.pages.length) {
      setPageNos(scriptViewData.pages.map(page => page.pageNo));
    }
  }, [scriptViewData]);

  useEffect(() => {
    if (pageNos.length) setPageNo(pageNos[0]);
  }, [pageNos]);

  interface HeaderProps {
    subtitle: string;
  }
  const Header: React.FC<HeaderProps> = ({ subtitle }) => (
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
            <Typography variant="subtitle1">{subtitle}</Typography>
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
        <Header
          subtitle={`Marking question template ID ${questionTemplateId}`}
        />
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
      pages
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

    const getCurrentPageQuestions = () => {
      const currentPage = pages.find(page => page.pageNo === pageNo)!;
      const currentPageQuestions = questions.filter(question =>
        currentPage.questionIds.includes(question.id)
      );
      return currentPageQuestions;
    };

    return (
      <div className={classes.container}>
        <Header subtitle={`Marking Q${rootQuestionTemplate.name}`} />
        {pages
          .filter(page => page.pageNo === pageNo)
          .map((page, index) => {
            return (
              <div className={classes.grow} key={index}>
                <Annotator
                  key={page.id}
                  page={page}
                  questions={getCurrentPageQuestions()}
                  rootQuestionTemplate={rootQuestionTemplate}
                  matriculationNumber={matriculationNumber}
                />
              </div>
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
      <Header subtitle={`Marking question template ID ${questionTemplateId}`} />
      <Container maxWidth={false} className={classes.innerContainer}>
        <Typography variant="subtitle1">No scripts to mark.</Typography>
      </Container>
    </div>
  );
};

export default MarkQuestionPage;
