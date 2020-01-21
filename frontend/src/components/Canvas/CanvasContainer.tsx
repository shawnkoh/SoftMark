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
    | "backgroundLinesArray"
    | "foregroundLines"
    | "backgroundTextsArray"
    | "foregroundTexts"
    | "mode"
    | "penColor"
    | "penWidth"
    | "position"
    | "scale"
    | "onForegroundLinesChange"
    | "onForegroundTextsChange"
    | "onViewChange"
  >
>;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    canvasContainer: {
      flexGrow: 1,
      backgroundColor: "grey",
      touchAction: "none"
    }
  })
);

const CanvasContainer: React.FC<Props> = ({
  backgroundImageSource = "",
  backgroundLinesArray = [[]],
  foregroundLines = [],
  backgroundTextsArray = [[]],
  foregroundTexts = [],
  mode = CanvasMode.View,
  penColor = "ff0000",
  penWidth = 5,
  position = { x: 0, y: 0 },
  scale = 1.0,
  onForegroundLinesChange = annotationLines => {},
  onForegroundTextsChange = annotationTexts => {},
  onViewChange = (position, scale) => {}
}: Props) => {
  const classes = useStyles();

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const checkSize = () => {
    const currentCanvasContainerRef = canvasContainerRef.current;
    if (currentCanvasContainerRef) {
      const width = currentCanvasContainerRef.clientWidth;
      const height = currentCanvasContainerRef.clientHeight;
      setWidth(width);
      setHeight(height);
    }
  };

  useEffect(checkSize, [canvasContainerRef]);
  useEffect(() => {
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return (
    <div ref={canvasContainerRef} className={classes.canvasContainer}>
      <Canvas
        width={width}
        height={height}
        backgroundImageSource={backgroundImageSource}
        backgroundLinesArray={backgroundLinesArray}
        foregroundLines={foregroundLines}
        backgroundTextsArray={backgroundTextsArray}
        foregroundTexts={foregroundTexts}
        mode={mode}
        penColor={penColor}
        penWidth={penWidth}
        position={position}
        scale={scale}
        onForegroundLinesChange={onForegroundLinesChange}
        onForegroundTextsChange={onForegroundTextsChange}
        onViewChange={onViewChange}
      />
    </div>
  );
};

export default CanvasContainer;
