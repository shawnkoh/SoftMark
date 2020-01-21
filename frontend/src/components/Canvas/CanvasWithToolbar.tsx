import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import isEqual from "lodash/isEqual";
import useImageSize from "@use-hooks/image-size";
import useComponentSize from "@rehooks/component-size";

import { AnnotationLine, AnnotationText } from "backend/src/types/annotations";
import { Point, CanvasMode, CanvasProps } from "./types";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Slider from "@material-ui/core/Slider";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import PanIcon from "@material-ui/icons/PanTool";
import PenIcon from "mdi-material-ui/Pen";
import TextIcon from "mdi-material-ui/FormatText";
import EraserIcon from "mdi-material-ui/Eraser";
import MinWidthIcon from "mdi-material-ui/CircleMedium";
import MaxWidthIcon from "mdi-material-ui/Circle";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import HelpIcon from "@material-ui/icons/Help";

import CanvasContainer from "./CanvasContainer";
import HelpModal from "./CanvasWithToolbarHelpModal";
import LoadingSpinner from "components/LoadingSpinner";

type DrilledProps = Partial<
  Pick<
    CanvasProps,
    | "backgroundImageSource"
    | "backgroundLinesArray"
    | "foregroundLines"
    | "backgroundTextsArray"
    | "foregroundTexts"
    | "onForegroundLinesChange"
    | "onForegroundTextsChange"
    | "onViewChange"
  >
>;

type OwnProps = {
  transparentToolbar?: boolean;
  drawable?: boolean;
  isLoading?: boolean;
};

type Props = DrilledProps & OwnProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      touchAction: "none",
      position: "relative"
    },
    padding: {
      marginRight: theme.spacing(2)
    },
    sliderContainer: {
      width: theme.spacing(32)
    }
  })
);

const CanvasWithToolbar: React.FC<Props> = ({
  backgroundImageSource = "",
  backgroundLinesArray = [[]],
  foregroundLines = [],
  backgroundTextsArray = [[]],
  foregroundTexts = [],
  onForegroundLinesChange = annotationLines => {},
  onForegroundTextsChange = annotationTexts => {},
  onViewChange = (position, scale) => {},
  transparentToolbar = false,
  drawable = false,
  isLoading = false
}: Props) => {
  const classes = useStyles({});

  const [thisForegroundLines, setThisForegroundLines] = useState<
    AnnotationLine[]
  >(foregroundLines);
  const [thisForegroundTexts, setThisForegroundTexts] = useState<
    AnnotationText[]
  >(foregroundTexts);

  const handleForegroundLinesChange = (annotationLines: AnnotationLine[]) => {
    setThisForegroundLines(annotationLines); // update state
  };
  const handleForegroundTextsChange = (annotationTexts: AnnotationText[]) => {
    setThisForegroundTexts(annotationTexts); // update state
  };

  const handleClearAllClick = event => {
    setThisForegroundLines([]);
    setThisForegroundTexts([]);
  };

  useEffect(() => {
    if (!isEqual(foregroundLines, thisForegroundLines))
      onForegroundLinesChange(thisForegroundLines);
  }, [thisForegroundLines]);
  useEffect(() => {
    setThisForegroundLines(foregroundLines);
  }, [foregroundLines]);
  useEffect(() => {
    if (!isEqual(foregroundTexts, thisForegroundTexts))
      onForegroundTextsChange(thisForegroundTexts);
  }, [thisForegroundTexts]);
  useEffect(() => {
    setThisForegroundTexts(foregroundTexts);
  }, [foregroundTexts]);

  const defaultPosition = { x: 0, y: 64 };
  const [position, setPosition] = useState<Point>(defaultPosition);
  const defaultScale = 1.0;
  const [scale, setScale] = useState<number>(defaultScale);
  const handleViewChange = (position: Point, scale: number) => {
    setPosition(position);
    let clampedScale = scale > 10.0 ? 10.0 : scale;
    clampedScale = scale < 0.1 ? 0.1 : clampedScale;
    setScale(clampedScale);
  };
  const handleZoomOutClick = event =>
    setScale(prevValue => Math.max(0.1, Math.floor(prevValue * 0.9 * 10) / 10));
  const handleZoomInClick = event =>
    setScale(prevValue => Math.min(10.0, Math.ceil(prevValue * 1.1 * 10) / 10));
  const handleResetViewClick = event => {
    setPosition(defaultPosition);
    setScale(defaultScale);
  };
  useEffect(() => onViewChange(position, scale), [position, scale]);

  const ref = useRef(null);
  const { width, height } = useComponentSize(ref);
  const [imgWidth, imgHeight] = useImageSize(backgroundImageSource);
  const fitToViewport = () => {
    if (width !== 0 && height !== 0 && imgWidth !== 0 && imgHeight !== 0) {
      const actualHeight = height - 128;
      const scaleUsingWidth = width / imgWidth;
      const scaleUsingHeight = actualHeight / imgHeight;
      if (scaleUsingWidth < scaleUsingHeight) {
        const scale = scaleUsingWidth;
        setScale(scale);
        const displayedImgHeight = scale * imgHeight;
        const position = { x: 0, y: (actualHeight - displayedImgHeight) / 2 };
        setPosition(position);
      } else {
        const scale = scaleUsingHeight;
        setScale(scale);
        const displayedImgWidth = scale * imgWidth;
        const position = { x: (width - displayedImgWidth) / 2, y: 64 };
        setPosition(position);
      }
    }
  };
  useEffect(fitToViewport, [width, height, imgHeight, imgWidth]);

  const [canvasMode, setCanvasMode] = useState<CanvasMode>(
    drawable ? CanvasMode.Pen : CanvasMode.View
  );
  const handleCanvasMode = (event: any, newCanvasMode: CanvasMode) => {
    setCanvasMode(newCanvasMode);
  };

  const [penWidth, setPenWidth] = useState<number>(3);
  const handlePenWidthChange = (event: any, newValue: number | number[]) => {
    setPenWidth(newValue as number);
  };

  const [penColor, setPenColor] = useState<string>("#ff0000");
  const handlePenColorChange = event => setPenColor(event.target.value);

  const [textSize, setTextSize] = useState<number>(12);
  const handleTextSizeChange = event =>
    setTextSize(parseInt(event.target.value, 10));

  const [text, setText] = useState<string>("Type here");
  const handleTextChange = event => setText(event.target.value);

  return (
    <div ref={ref} className={classes.container}>
      <AppBar position="absolute" color="inherit">
        <Toolbar>
          {drawable && (
            <ToggleButtonGroup
              value={canvasMode}
              exclusive
              onChange={handleCanvasMode}
              aria-label="canvas mode"
              className={classes.padding}
            >
              <ToggleButton value={CanvasMode.Pen} aria-label="pen">
                <PenIcon />
              </ToggleButton>
              <ToggleButton value={CanvasMode.Text} aria-label="text">
                <TextIcon />
              </ToggleButton>
              <ToggleButton value={CanvasMode.Eraser} aria-label="eraser">
                <EraserIcon />
              </ToggleButton>
              <ToggleButton value={CanvasMode.View} aria-label="view">
                <PanIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          {canvasMode === CanvasMode.Pen && (
            <>
              <input
                type="color"
                onChange={handlePenColorChange}
                value={penColor}
                className={classes.padding}
              />
              <Grid
                container
                spacing={1}
                className={clsx(classes.sliderContainer, classes.padding)}
                alignItems="center"
              >
                <Grid item>
                  <MinWidthIcon />
                </Grid>
                <Grid item xs>
                  <Slider
                    value={penWidth}
                    onChange={handlePenWidthChange}
                    step={1}
                    marks
                    min={1}
                    max={10}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item>
                  <MaxWidthIcon />
                </Grid>
              </Grid>
            </>
          )}
          {canvasMode === CanvasMode.Text && (
            <>
              <input
                type="color"
                onChange={handlePenColorChange}
                value={penColor}
                className={classes.padding}
              />
              <select
                onChange={handleTextSizeChange}
                value={textSize}
                className={classes.padding}
              >
                <option value={8}>8</option>
                <option value={9}>9</option>
                <option value={10}>10</option>
                <option value={11}>11</option>
                <option value={12}>12</option>
                <option value={14}>14</option>
                <option value={16}>16</option>
                <option value={18}>18</option>
                <option value={20}>20</option>
                <option value={22}>22</option>
                <option value={24}>24</option>
                <option value={26}>26</option>
                <option value={28}>28</option>
                <option value={36}>36</option>
                <option value={48}>48</option>
                <option value={72}>72</option>
              </select>
              <input
                type="text"
                placeholder="Type here"
                onChange={handleTextChange}
                value={text}
                className={classes.padding}
              />
            </>
          )}
          {/*canvasMode === CanvasMode.Eraser && (
            <Button
              onClick={handleClearAllClick}
              color="inherit"
              className={classes.padding}
            >
              Clear All
            </Button>
          )*/}
          {canvasMode === CanvasMode.View && (
            <>
              <div className={classes.padding}>
                <IconButton onClick={handleZoomOutClick}>
                  <ZoomOutIcon />
                </IconButton>
                <Typography variant="button">
                  {scale.toLocaleString(undefined, { style: "percent" })}
                </Typography>
                <IconButton onClick={handleZoomInClick}>
                  <ZoomInIcon />
                </IconButton>
              </div>
              <Button
                onClick={fitToViewport}
                color="inherit"
                className={classes.padding}
              >
                Fit to Viewport
              </Button>
              <Button
                onClick={handleResetViewClick}
                color="inherit"
                className={classes.padding}
              >
                Reset View
              </Button>
            </>
          )}
          <HelpModal
            drawable={drawable}
            render={toggleModal => (
              <IconButton onClick={toggleModal}>
                <HelpIcon />
              </IconButton>
            )}
          />
        </Toolbar>
      </AppBar>
      {isLoading ? (
        <LoadingSpinner loadingMessage="Loading page" />
      ) : (
        <CanvasContainer
          backgroundImageSource={backgroundImageSource}
          backgroundLinesArray={backgroundLinesArray}
          foregroundLines={thisForegroundLines}
          backgroundTextsArray={backgroundTextsArray}
          foregroundTexts={thisForegroundTexts}
          onForegroundLinesChange={handleForegroundLinesChange}
          onForegroundTextsChange={handleForegroundTextsChange}
          onViewChange={handleViewChange}
          mode={canvasMode}
          penColor={penColor}
          penWidth={penWidth}
          text={text}
          textColor={penColor}
          textSize={textSize}
          position={position}
          scale={scale}
        />
      )}
    </div>
  );
};

export default CanvasWithToolbar;
