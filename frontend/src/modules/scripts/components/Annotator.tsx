import React, { useState, useEffect } from "react";

import { saveAnnotation, getOwnAnnotation } from "../../../api/annotations";
import { Annotation, AnnotationPostData } from "backend/src/types/annotations";
import { PageData } from "backend/src/types/pages";
import { CanvasMode } from "../../../types/canvas";

import Canvas from "./Canvas";

interface OwnProps {
  pageId: number;
  backgroundImageSource: string;
}

type Props = OwnProps;

const Annotator: React.FC<Props> = ({
  pageId,
  backgroundImageSource
}: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);

  const [mode, setMode] = useState(CanvasMode.Pen);
  const [penColor, setPenColor] = useState("#ff0000");
  const [penWidth, setPenWidth] = useState(5);
  const [foregroundAnnotation, setForegroundAnnotation] = useState<Annotation>(
    []
  );
  const [backgroundAnnotations, setBackgroundAnnotations] = useState<
    Annotation[]
  >([[]]);

  useEffect(() => {
    getOwnAnnotation(pageId)
      .then(res => {
        setForegroundAnnotation(res.data.annotation.layer);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // TODO: get background annotations

  const handlePenClick = event => setMode(CanvasMode.Pen);
  const handleEraserClick = event => setMode(CanvasMode.Eraser);
  const handleViewClick = event => setMode(CanvasMode.View);
  const handlePenColorChange = event => setPenColor(event.target.value);
  const handlePenWidthChange = event =>
    setPenWidth(parseInt(event.target.value, 10));
  const handleClearClick = event => setForegroundAnnotation([]);
  const onForegroundAnnotationChange = (annotation: Annotation) => {
    setForegroundAnnotation(annotation);
    const annotationPostData: AnnotationPostData = {
      layer: annotation
    };
    saveAnnotation(pageId, annotationPostData);
  };

  if (isLoading) {
    return <div>Loading annotations...</div>;
  }

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

export default Annotator;
