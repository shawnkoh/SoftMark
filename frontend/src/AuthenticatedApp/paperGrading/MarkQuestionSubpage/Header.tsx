import {
  AppBar,
  Button,
  Hidden,
  IconButton,
  Toolbar,
  Typography
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import usePaper from "contexts/PaperContext";
import React from "react";
import { Link } from "react-router-dom";
import useMarkQuestion from "./MarkQuestionContext";
import useStyles from "./styles";

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

export default Header;
