import React, { useState, useEffect, useRef } from "react";
import { useStateWithCallbackInstant } from "use-state-with-callback";

import { Annotation } from "backend/src/types/annotations";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/core/Slider";
import PenIcon from "@material-ui/icons/BorderColor";
import EraserIcon from "@material-ui/icons/PhonelinkErase";
import PanIcon from "@material-ui/icons/PanTool";
import CanvasContainer from "./CanvasContainer";
import { CanvasProps, CanvasMode } from "./types";

type Props = Partial<
  Pick<
    CanvasProps,
    | "backgroundImageSource"
    | "backgroundAnnotations"
    | "foregroundAnnotation"
    | "onForegroundAnnotationChange"
  >
>;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column"
    },
    grow: {
      flexGrow: 1
    },
    sliderContainer: {
      width: theme.spacing(8)
    }
  })
);

const CanvasWithControls: React.FC<Props> = ({
  backgroundImageSource = "",
  backgroundAnnotations = [[]],
  foregroundAnnotation = [],
  onForegroundAnnotationChange = annotation => {}
}: Props) => {
  const classes = useStyles({});

  const [fgAnnotation, setFgAnnotation] = useState<Annotation>(
    foregroundAnnotation
  );
  const handleForegroundAnnotationChange = (annotation: Annotation) => {
    setFgAnnotation(annotation);
    onForegroundAnnotationChange(annotation);
  };
  const handleClearClick = event => setFgAnnotation([]);

  const [canvasMode, setCanvasMode] = useState<CanvasMode>(CanvasMode.Pen);
  const handleCanvasMode = (
    event: React.MouseEvent<HTMLElement>,
    newCanvasMode: CanvasMode
  ) => {
    setCanvasMode(newCanvasMode);
  };

  const [penWidth, setPenWidth] = useState<number>(5);
  const handlePenWidthChange = (event: any, newValue: number | number[]) => {
    setPenWidth(newValue as number);
  };

  const [penColor, setPenColor] = useState<string>("#ff0000");
  const handlePenColorChange = event => setPenColor(event.target.value);

  const [toResetView, setToResetView] = useStateWithCallbackInstant(false, () =>
    setToResetView(false)
  );
  const handleResetViewClick = event => setToResetView(true);

  return (
    <div className={classes.container}>
      <AppBar position="static">
        <Toolbar>
          <div className={classes.grow}>
            <ToggleButtonGroup
              value={canvasMode}
              exclusive
              onChange={handleCanvasMode}
              aria-label="canvas mode"
            >
              <ToggleButton value={CanvasMode.Pen} aria-label="pen">
                <PenIcon />
              </ToggleButton>
              <ToggleButton value={CanvasMode.Eraser} aria-label="eraser">
                <EraserIcon />
              </ToggleButton>
              <ToggleButton value={CanvasMode.View} aria-label="view">
                <PanIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            {canvasMode === CanvasMode.Pen && (
              <>
                <input
                  type="color"
                  onChange={handlePenColorChange}
                  value={penColor}
                />
                <div className={classes.sliderContainer}>
                  <Slider
                    value={penWidth}
                    onChange={handlePenWidthChange}
                    step={1}
                    marks
                    min={1}
                    max={10}
                  />
                </div>
              </>
            )}
            {canvasMode === CanvasMode.View && (
              <Button onClick={handleResetViewClick} color="inherit">
                Reset View
              </Button>
            )}
          </div>
          <Button onClick={handleClearClick} color="inherit">
            Clear Canvas
          </Button>
        </Toolbar>
      </AppBar>
      <CanvasContainer
        backgroundImageSource={backgroundImageSource}
        backgroundAnnotations={backgroundAnnotations}
        foregroundAnnotation={fgAnnotation}
        onForegroundAnnotationChange={handleForegroundAnnotationChange}
        mode={canvasMode}
        penColor={penColor}
        penWidth={penWidth}
        resetView={toResetView}
      />
    </div>
  );
};

export default CanvasWithControls;
