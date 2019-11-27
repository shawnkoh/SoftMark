import React, { useState, useEffect, useRef } from "react";

import { CanvasProps, CanvasMode } from "./types";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Canvas from "./Canvas";

/*
CanvasContainer component automatically fills space of its parent element
if parent element is a flex container
*/

/* For future improvement
type StyleProps = {
  backgroundColor: string;
};
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
    | "position"
    | "scale"
    | "onForegroundAnnotationChange"
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
  backgroundAnnotations = [[]],
  foregroundAnnotation = [],
  mode = CanvasMode.View,
  penColor = "ff0000",
  penWidth = 5,
  position = { x: 0, y: 0 },
  scale = 1.0,
  onForegroundAnnotationChange = annotation => {},
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
        backgroundAnnotations={backgroundAnnotations}
        foregroundAnnotation={foregroundAnnotation}
        mode={mode}
        penColor={penColor}
        penWidth={penWidth}
        position={position}
        scale={scale}
        onForegroundAnnotationChange={onForegroundAnnotationChange}
        onViewChange={onViewChange}
      />
    </div>
  );
};

export default CanvasContainer;
