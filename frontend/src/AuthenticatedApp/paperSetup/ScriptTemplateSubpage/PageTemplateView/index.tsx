import { Box, Fab, IconButton, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import BackIcon from "@material-ui/icons/ArrowBackIos";
import ForwardIcon from "@material-ui/icons/ArrowForwardIos";
import useScriptSetup from "AuthenticatedApp/paperSetup/context/ScriptSetupContext";
import { PageTemplateSetupData } from "backend/src/types/pageTemplates";
import React, { useLayoutEffect, useRef, useState } from "react";
import ScriptTemplateQuestion from "../ScriptTemplateGradebox";
import useStyles from "./useStyles";

const PageTemplateView: React.FC<{
  pageTemplate: PageTemplateSetupData;
}> = props => {
  const classes = useStyles();
  const { pageTemplate } = props;
  const {
    currentPageNo,
    pageCount,
    goPage,
    addLeaf,
    leafQuestions
  } = useScriptSetup();

  const imgRef = useRef<HTMLImageElement>(null);
  const [imgScale, setImgScale] = useState(1.0);
  const [imgLoaded, setImgLoaded] = useState(false);
  useLayoutEffect(() => {
    if (imgRef.current) {
      const imgEle = imgRef.current;
      window.addEventListener("resize", () =>
        setImgScale(imgEle.width / imgEle.naturalWidth)
      );
      setImgScale(imgEle.width / imgEle.naturalWidth);
    }
  }, [imgRef.current, imgLoaded]);

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={pageTemplate.pageNo !== currentPageNo}
      className={classes.panel}
    >
      <Fab onClick={addLeaf} color="primary" className={classes.addFab}>
        <AddIcon />
      </Fab>
      <Box p={0} display="flex" justifyContent="center" alignItems="center">
        <IconButton
          onClick={() => goPage(currentPageNo - 1)}
          disabled={currentPageNo === 1}
        >
          <BackIcon />
        </IconButton>
        <div className={classes.container}>
          <img
            ref={imgRef}
            className={classes.scriptImage}
            src={pageTemplate.imageUrl}
            onLoad={() => setImgLoaded(true)}
          />

          {Object.keys(leafQuestions).map(key =>
            leafQuestions[key].displayPage === currentPageNo ? (
              <ScriptTemplateQuestion key={key} id={+key} imgScale={imgScale}/>
            ) : (
              <></>
            )
          )}
        </div>
        <IconButton
          onClick={() => goPage(currentPageNo + 1)}
          disabled={currentPageNo === pageCount}
        >
          <ForwardIcon />
        </IconButton>
      </Box>
    </Typography>
  );
};

export default PageTemplateView;
