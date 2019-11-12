import React, { useState, useEffect } from "react";
import { useStateWithCallbackInstant } from "use-state-with-callback";

import { saveAnnotation, getOwnAnnotation } from "../../../api/annotations";
import { Annotation, AnnotationPostData } from "backend/src/types/annotations";
import { PageData } from "backend/src/types/pages";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import Canvas from "../../../components/Canvas";
import { CanvasMode } from "../../../components/Canvas/types";

interface OwnProps {
  pageId: number;
  backgroundImageSource: string;
}

type Props = OwnProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      minHeight: "100vh",
      minWidth: "100vw",
      display: "flex",
      flexDirection: "column"
    },
    grow: {
      display: "flex",
      flexGrow: 1
    }
  })
);

const Annotator: React.FC<Props> = ({
  pageId,
  backgroundImageSource
}: Props) => {
  const classes = useStyles();

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
  const [toResetView, setToResetView] = useStateWithCallbackInstant(false, () =>
    setToResetView(false)
  );

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
  const handleResetViewClick = event => setToResetView(true);
  /*
  useLayoutEffect(() => {
    if (toResetView) setToResetView(false);
  }, [toResetView]);
  */

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
    <div className={classes.container}>
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
        <button onClick={handleResetViewClick}>Reset View</button>
      </div>
      <div className={classes.grow}>
        <Canvas
          backgroundImageSource={backgroundImageSource}
          backgroundAnnotations={backgroundAnnotations}
          foregroundAnnotation={foregroundAnnotation}
          mode={mode}
          penColor={penColor}
          penWidth={penWidth}
          onForegroundAnnotationChange={onForegroundAnnotationChange}
          resetView={toResetView}
        />
      </div>
    </div>
  );
};

export default Annotator;
