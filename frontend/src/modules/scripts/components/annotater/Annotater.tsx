import React, { useState, useRef } from "react";

import Canvas from "./Canvas";
import { CanvasMode } from "../../../../types/canvas";

interface OwnProps {
  imageUrl: string;
  pageId: number;
}

type Props = OwnProps;

const Annotater: React.FC<Props> = ({ imageUrl, pageId }) => {
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
  const handleForegroundAnnotationChange = console.log;

  const canvas = (
    <Canvas
      ref={canvasRef}
      width={1000}
      height={1250}
      backgroundImageSource={imageUrl}
      backgroundAnnotations={
        [
          /*[
          {
            points: [10, 10, 20, 20],
            type: "source-over",
            color: "blue",
            width: 5
          },
          {
            points: [30, 30, 40, 40],
            type: "source-over",
            color: "blue",
            width: 3
          }
        ],
        [
          {
            points: [50, 50, 60, 60],
            type: "source-over",
            color: "green",
            width: 5
          },
          {
            points: [70, 70, 80, 80],
            type: "source-over",
            color: "green",
            width: 5
          }
        ]*/
        ]
      }
      foregroundAnnotation={[]}
      mode={mode}
      penColor={penColor}
      penWidth={penWidth}
      onForegroundAnnotationChange={handleForegroundAnnotationChange}
    />
  );

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

/* let canvasProps = {
    width: 500,
    height: 500,
    backgroundImageSource:
      "https://singaporelearner.com/wp-content/uploads/2013/11/scan0010-724x1024.jpg",
    backgroundAnnotations: [
      [
        {
          points: [10, 10, 20, 20],
          type: "source-over",
          color: "blue",
          width: 5
        },
        {
          points: [30, 30, 40, 40],
          type: "source-over",
          color: "blue",
          width: 3
        }
      ],
      [
        {
          points: [50, 50, 60, 60],
          type: "source-over",
          color: "green",
          width: 5
        },
        {
          points: [70, 70, 80, 80],
          type: "source-over",
          color: "green",
          width: 5
        }
      ]
    ],
    foregroundAnnotation: [],
    mode: mode,
    penColor: penColor,
    penWidth: penWidth,
    onForegroundAnnotationChange: handleForegroundAnnotationChange
  };*/
