import React, { useState, useEffect } from "react";

import { Annotation } from "backend/src/types/annotations";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import { CanvasWithToolbar } from "../../../components/Canvas";

interface OwnProps {
  backgroundImageSource: string;
  annotations: Annotation[];
}

type Props = OwnProps;

const Annotator: React.FC<Props> = ({
  backgroundImageSource,
  annotations
}: Props) => {
  return (
    <CanvasWithToolbar
      backgroundImageSource={backgroundImageSource}
      backgroundAnnotations={annotations}
    />
  );
};

export default Annotator;
