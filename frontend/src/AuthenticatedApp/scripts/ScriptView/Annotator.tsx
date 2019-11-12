import React, { useState, useEffect } from "react";

import { saveAnnotation, getOwnAnnotation } from "../../../api/annotations";
import { Annotation, AnnotationPostData } from "backend/src/types/annotations";
import { PageData } from "backend/src/types/pages";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import { CanvasWithToolbar } from "../../../components/Canvas";

interface OwnProps {
  pageId: number;
  backgroundImageSource: string;
}

type Props = OwnProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

  const handleForegroundAnnotationChange = (annotation: Annotation) => {
    const annotationPostData: AnnotationPostData = {
      layer: annotation
    };
    saveAnnotation(pageId, annotationPostData);
  };

  if (isLoading) {
    return <div>Loading annotations...</div>;
  }

  return (
    <CanvasWithToolbar
      drawable
      backgroundImageSource={backgroundImageSource}
      backgroundAnnotations={backgroundAnnotations}
      foregroundAnnotation={foregroundAnnotation}
      onForegroundAnnotationChange={handleForegroundAnnotationChange}
    />
  );
};

export default Annotator;
