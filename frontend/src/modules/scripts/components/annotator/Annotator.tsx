import React, { useState } from "react";

import Canvas from "./Canvas";
import { CanvasMode, Annotation } from "../../../../types/canvas";

interface OwnProps {
  backgroundImageSource: string;
  backgroundAnnotations: Annotation[];
  initialForegroundAnnotation: Annotation;
  onForegroundAnnotationChange: (annotation: Annotation) => void;
}

type Props = OwnProps;

const Annotater: React.FC<Props> = ({
  backgroundImageSource,
  backgroundAnnotations,
  initialForegroundAnnotation,
  onForegroundAnnotationChange: foregroundAnnotationChangeCallback
}: Props) => {
  const [mode, setMode] = useState(CanvasMode.Pen);
  const [penColor, setPenColor] = useState("#ff0000");
  const [penWidth, setPenWidth] = useState(5);
  const [foregroundAnnotation, setForegroundAnnotation] = useState(
    initialForegroundAnnotation
  );

  const handlePenClick = event => setMode(CanvasMode.Pen);
  const handleEraserClick = event => setMode(CanvasMode.Eraser);
  const handleViewClick = event => setMode(CanvasMode.View);
  const handlePenColorChange = event => setPenColor(event.target.value);
  const handlePenWidthChange = event =>
    setPenWidth(parseInt(event.target.value, 10));
  const handleClearClick = event => setForegroundAnnotation([]);
  const onForegroundAnnotationChange = (annotation: Annotation) => {
    setForegroundAnnotation(annotation);
    foregroundAnnotationChangeCallback(annotation);
  };

  return (
    <div>
      <button
        onClick={handlePenClick}
        style={{ color: mode === "pen" ? "red" : undefined }}
      >
        Pen
      </button>
      <button
        onClick={handleEraserClick}
        style={{ color: mode === "eraser" ? "red" : undefined }}
      >
        Eraser
      </button>
      <button
        onClick={handleViewClick}
        style={{ color: mode === "view" ? "red" : undefined }}
      >
        View
      </button>
      <input type="color" onChange={handlePenColorChange} value={penColor} />
      <input
        type="range"
        onChange={handlePenWidthChange}
        min="1"
        max="10"
        value={penWidth}
      />
      <button onClick={handleClearClick}>Clear Canvas</button>
      <Canvas
        width={1000}
        height={1250}
        backgroundImageSource={backgroundImageSource}
        backgroundAnnotations={backgroundAnnotations}
        foregroundAnnotation={foregroundAnnotation}
        mode={mode}
        penColor={penColor}
        penWidth={penWidth}
        onForegroundAnnotationChange={onForegroundAnnotationChange}
      />
    </div>
  );
};

export default Annotater;
