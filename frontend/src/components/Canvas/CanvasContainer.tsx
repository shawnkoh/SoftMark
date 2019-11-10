import React, { useState, useEffect, useRef } from "react";

import { CanvasProps, CanvasMode } from "./types";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Canvas from "./Canvas";

/*
    CanvasContainer component automatically fills space of its parent element
    if parent element is a flex container
*/

type Props = Partial<
  Pick<
    CanvasProps,
    | "backgroundImageSource"
    | "backgroundAnnotations"
    | "foregroundAnnotation"
    | "mode"
    | "penColor"
    | "penWidth"
    | "onForegroundAnnotationChange"
    | "resetView"
  >
>;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    canvasContainer: {
      flexGrow: 1,
      backgroundColor: "grey"
    }
  })
);

const CanvasContainer: React.FC<Props> = ({
  backgroundImageSource = "",
  backgroundAnnotations = [[]],
  foregroundAnnotation = [],
  mode = CanvasMode.View,
  penColor = "ff0000",
  penWidth = 5,
  onForegroundAnnotationChange = annotation => {},
  resetView = false
}: Props) => {
  const classes = useStyles();

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const checkSize = () => {
    const currentCanvasContainerRef = canvasContainerRef.current;
    if (currentCanvasContainerRef) {
      const width = currentCanvasContainerRef.offsetWidth;
      const height = currentCanvasContainerRef.offsetHeight;
      setWidth(width);
      setHeight(height);
    }
  };

  useEffect(() => {
    checkSize();
    window.addEventListener("resize", checkSize);
    return window.removeEventListener("resize", checkSize);
  });

  return (
    <div ref={canvasContainerRef} className={classes.canvasContainer}>
      <Canvas
        width={width}
        height={height}
        backgroundImageSource={backgroundImageSource}
        backgroundAnnotations={backgroundAnnotations}
        foregroundAnnotation={foregroundAnnotation}
        mode={mode}
        penColor={penColor}
        penWidth={penWidth}
        onForegroundAnnotationChange={onForegroundAnnotationChange}
        resetView={resetView}
      />
    </div>
  );
};

export default CanvasContainer;
