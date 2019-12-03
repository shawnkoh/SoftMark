import {
  AppBar,
  Avatar,
  Chip,
  Toolbar,
  Typography,
  FormControlLabel,
  Switch
} from "@material-ui/core";
import { Annotation, AnnotationPostData } from "backend/src/types/annotations";
import {
  PageViewData,
  QuestionTemplateViewData,
  QuestionViewData
} from "backend/src/types/view";
import { MarkData } from "backend/src/types/marks";
import clsx from "clsx";
import LoadingSpinner from "components/LoadingSpinner";
import produce from "immer";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getOwnAnnotation, saveAnnotation } from "../../../api/annotations";
import { CanvasWithToolbar } from "../../../components/Canvas";
import { Point } from "../../../components/Canvas/types";
import ReversedChip from "../../../components/ReversedChip";
import MarkQuestionModal from "./MarkQuestionModal";
import useStyles from "./styles";

interface OwnProps {
  page: PageViewData;
  questions: QuestionViewData[];
  rootQuestionTemplate: QuestionTemplateViewData;
  matriculationNumber: string | null;
}

type Props = OwnProps;

const Annotator: React.FC<Props> = ({
  page,
  questions,
  rootQuestionTemplate,
  matriculationNumber
}: Props) => {
  const classes = useStyles();

  const [showMarkingChipsOnPage, setShowMarkingChipsOnPage] = useState<boolean>(
    true
  );
  const toggleShowMarkingChipsOnPage = () =>
    setShowMarkingChipsOnPage(prev => !prev);

  interface QuestionState {
    isVisible: boolean;
    question: QuestionViewData;
  }
  const initialQuestionStates = questions.map(question => ({
    isVisible: false,
    question
  }));
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    initialQuestionStates
  );
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1.0);
  const handleViewChange = (position: Point, scale: number) => {
    setPosition(position);
    setScale(scale);
  };

  const [
    foregroundAnnotation,
    setForegroundAnnotation
  ] = useState<Annotation | null>(null);
  const [
    isLoadingForegroundAnnotation,
    setIsLoadingForegroundAnnotation
  ] = useState(true);

  const getForegroundAnnotation = () => {
    getOwnAnnotation(page.id)
      .then(res => {
        const status = res.request.status;
        if (status === 200) {
          const savedAnnotation = res.data.annotation;
          setForegroundAnnotation(savedAnnotation.layer);
        } else if (status === 204) {
          setForegroundAnnotation([]); // set no foreground annotation if none exists in db yet
        }
      })
      .finally(() => setIsLoadingForegroundAnnotation(false));
  };

  useEffect(getForegroundAnnotation, []);

  const handleForegroundAnnotationChange = (annotation: Annotation) => {
    const annotationPostData: AnnotationPostData = {
      layer: annotation
    };
    saveAnnotation(page.id, annotationPostData).catch(() => {
      toast.error(
        "An error occurred while saving the annotation. Please try refreshing the page."
      );
    });
  };

  const handleModalCancel = (index: number) => {
    setQuestionStates(
      produce(questionStates, draftState => {
        draftState[index].isVisible = false;
      })
    );
    setAnchorEl(null);
  };

  const handleModalSave = (
    index: number,
    score: number | null,
    markId: number | null
  ) => {
    setQuestionStates(
      produce(questionStates, draftState => {
        draftState[index].isVisible = false;
        draftState[index].question.score = score;
        draftState[index].question.markId = markId;
      })
    );
    setAnchorEl(null);
  };

  const handleChipClick = (
    event: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    setAnchorEl(event.currentTarget);
    setQuestionStates(
      produce(questionStates, draftState => {
        draftState[index].isVisible = true;
      })
    );
  };

  if (isLoadingForegroundAnnotation) {
    return <LoadingSpinner loadingMessage="Loading annotations..." />;
  }

  if (!foregroundAnnotation) {
    return (
      <>
        There was an error loading your annotations. Please try refreshing the
        page and check your internet connection.
      </>
    );
  }

  return (
    <div className={classes.canvasWithToolbarContainer}>
      {questionStates.map((questionState: QuestionState, index: number) => (
        <MarkQuestionModal
          key={index}
          anchorEl={anchorEl}
          question={questionState.question}
          isVisible={questionState.isVisible}
          onCancel={() => handleModalCancel(index)}
          onSave={(score, markId) => handleModalSave(index, score, markId)}
        />
      ))}
      <CanvasWithToolbar
        drawable
        backgroundImageSource={page.imageUrl || ""}
        backgroundAnnotations={[[]]}
        foregroundAnnotation={foregroundAnnotation}
        onForegroundAnnotationChange={handleForegroundAnnotationChange}
        onViewChange={handleViewChange}
      />
      {showMarkingChipsOnPage &&
        questionStates.map((questionState: QuestionState, index: number) => (
          <ReversedChip
            key={index}
            onClick={event => handleChipClick(event, index)}
            label={"Q" + questionState.question.name}
            avatar={
              <Avatar>{`${
                questionState.question.score === null
                  ? "-"
                  : questionState.question.score
              } / ${questionState.question.maxScore || "-"}`}</Avatar>
            }
            color={
              questionState.question.score === null ? "default" : "primary"
            }
            style={{
              position: "absolute",
              left: questionState.question.leftOffset * scale + position.x,
              top: questionState.question.topOffset * scale + position.y
            }}
          />
        ))}
      <AppBar position="fixed" color="inherit" className={classes.questionBar}>
        <Toolbar>
          <Typography
            variant="button"
            className={clsx(classes.grow, classes.questionBarItem)}
          >
            Page {page.pageNo}
          </Typography>
          <Chip
            label={"Q" + rootQuestionTemplate.name}
            variant="outlined"
            className={classes.questionBarItem}
          />
          {questionStates.map((questionState: QuestionState, index: number) => (
            <ReversedChip
              key={index}
              onClick={event => handleChipClick(event, index)}
              label={"Q" + questionState.question.name}
              avatar={
                <Avatar>{`${
                  questionState.question.score === null
                    ? "-"
                    : questionState.question.score
                } / ${questionState.question.maxScore || "-"}`}</Avatar>
              }
              color={
                questionState.question.score === null ? "default" : "primary"
              }
              className={classes.questionBarItem}
            />
          ))}
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={showMarkingChipsOnPage}
                onChange={toggleShowMarkingChipsOnPage}
              />
            }
            label="Show on page"
          />
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Annotator;
