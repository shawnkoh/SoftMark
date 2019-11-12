import React, { useState, useEffect } from "react";

import { saveAnnotation, getOwnAnnotation } from "../../../api/annotations";
import { Annotation, AnnotationPostData } from "backend/src/types/annotations";

import { CanvasWithToolbar } from "../../../components/Canvas";

interface OwnProps {
  pageId: number;
  backgroundImageSource: string;
  foregroundAnnotation: Annotation;
}

type Props = OwnProps;

const Annotator: React.FC<Props> = ({
  pageId,
  backgroundImageSource,
  foregroundAnnotation
}: Props) => {
  const handleForegroundAnnotationChange = (annotation: Annotation) => {
    const annotationPostData: AnnotationPostData = {
      layer: annotation
    };
    saveAnnotation(pageId, annotationPostData);
  };

  return (
    <CanvasWithToolbar
      drawable
      backgroundImageSource={backgroundImageSource}
      backgroundAnnotations={[[]]}
      foregroundAnnotation={foregroundAnnotation}
      onForegroundAnnotationChange={handleForegroundAnnotationChange}
    />
  );
};

export default Annotator;
