import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { AppState } from "../../../types/store";
import api from "../../../api";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";

import Annotator from "../../scripts/components/annotator/Annotator";
import TogglePageComponent from "../../scripts/components/misc/TogglePageComponent";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";

type Props = RouteComponentProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      height: "100vh",
      width: "100vw"
    },
    leftButton: {
      position: "absolute",
      left: theme.spacing(2),
      bottom: theme.spacing(2)
    },
    rightButton: {
      position: "absolute",
      right: theme.spacing(2),
      bottom: theme.spacing(2)
    }
  })
);

const ScriptTemplateView: React.FC<Props> = ({ match: { params } }) => {
  const classes = useStyles();

  const paper_id = +(params as { paper_id: string }).paper_id;
  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);

  const [viewPageNo, setViewPageNo] = useState(1);
  const incrementViewPageNo = () => setViewPageNo(viewPageNo + 1);
  const decrementViewPageNo = () => setViewPageNo(viewPageNo - 1);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  useEffect(() => {
    api.scriptTemplates
      .getScriptTemplate(paper_id)
      .then(resp => {
        console.log(resp);
        setScriptTemplate(resp.data.scriptTemplate);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <>
        <LoadingSpinner />
        Loading script template...
      </>
    );
  }

  if (!scriptTemplate) {
    return <>The script does not exist</>;
  }

  return (
    <div className={classes.container}>
      {scriptTemplate.pageTemplates.map((page, index) => {
        return (
          <>
            {page.pageNo === viewPageNo && (
              <Annotator
                key={page.id}
                pageId={page.id}
                backgroundImageSource={page.imageUrl}
              />
            )}
          </>
        );
      })}
      <IconButton
        edge="start"
        onClick={decrementViewPageNo}
        className={classes.leftButton}
        color="inherit"
        aria-label="previous page"
      >
        <ArrowLeftIcon />
      </IconButton>
      <IconButton
        edge="end"
        onClick={incrementViewPageNo}
        className={classes.rightButton}
        color="inherit"
        aria-label="next page"
      >
        <ArrowRightIcon />
      </IconButton>
    </div>
  );
};

export default withRouter(ScriptTemplateView);
