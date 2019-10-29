import React, { useState, useRef, useEffect } from "react";

import Canvas from "./Canvas";
import { CanvasMode } from "../../../../types/canvas";
import {
  AnnotationLine,
  AnnotationPostData
} from "backend/src/types/annotations";
import api from "../../../../api";
import { PageData } from "backend/src/types/pages";
import { response } from "express";

interface OwnProps {
  imageUrl: string;
  pageId: number;
}

type Props = OwnProps;

const Annotater: React.FC<Props> = ({ imageUrl, pageId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);

  const canvasRef = useRef<any>(null);
  const [mode, setMode] = useState(CanvasMode.Pen);
  const [penColor, setPenColor] = useState("#ff0000");
  const [penWidth, setPenWidth] = useState(5);

  const handlePenClick = event => setMode(CanvasMode.Pen);
  const handleEraserClick = event => setMode(CanvasMode.Eraser);
  const handleViewClick = event => setMode(CanvasMode.View);
  const handlePenColorChange = event => setPenColor(event.target.value);
  const handlePenWidthChange = event =>
    setPenWidth(parseInt(event.target.value, 10));
  const handleClearClick = event => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  const [foregroundAnnotation, setForegroundAnnotation] = useState<
    AnnotationLine[]
  >([]);
  const handleForegroundAnnotationChange = (lines: AnnotationLine[]) => {
    setForegroundAnnotation(lines);
    const annotationPostData: AnnotationPostData = {
      layer: lines
    };
    api.annotations.saveAnnotation(pageId, annotationPostData);
  };
  useEffect(() => {
    api.annotations
      .getOwnAnnotation(pageId)
      .then(res => {
        setForegroundAnnotation(res.data.annotation.layer);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const canvas = (
    <Canvas
      ref={canvasRef}
      width={1000}
      height={1250}
      backgroundImageSource={imageUrl}
      backgroundAnnotations={[]}
      foregroundAnnotation={foregroundAnnotation}
      mode={mode}
      penColor={penColor}
      penWidth={penWidth}
      onForegroundAnnotationChange={handleForegroundAnnotationChange}
    />
  );

  if (isLoading) {
    return <div> Loading annotations... </div>;
  }

  return (
    <div className="App">
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
      {canvas}
    </div>
  );
};

export default Annotater;
