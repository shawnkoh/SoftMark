import React, { useState, useEffect } from "react";
import { useStateWithCallbackInstant } from "use-state-with-callback";

import { saveAnnotation, getOwnAnnotation } from "../../../api/annotations";
import { Annotation, AnnotationPostData } from "backend/src/types/annotations";
import { PageData } from "backend/src/types/pages";

import { AppBar, IconButton, Toolbar, Typography } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import CanvasWithControls from "../../../components/Canvas/CanvasWithControls";
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
    <div className={classes.container}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <IconButton color="inherit">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Placeholder Title</Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.grow}>
        <CanvasWithControls
          backgroundImageSource={backgroundImageSource}
          backgroundAnnotations={backgroundAnnotations}
          foregroundAnnotation={foregroundAnnotation}
          onForegroundAnnotationChange={handleForegroundAnnotationChange}
        />
      </div>
    </div>
  );
};

export default Annotator;
