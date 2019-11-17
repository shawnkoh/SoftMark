import React, { useEffect, useState } from "react";
import { useHistory, RouteComponentProps } from "react-router";
import { Route, Switch } from "react-router-dom";
import { Link } from "react-router-dom";
import { ScriptListData } from "backend/src/types/scripts";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import api from "../../../api";
import usePaper from "../../../contexts/PaperContext";

import { Button, Box, Container, Grid, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import LoadingSpinner from "../../../components/LoadingSpinner";
import UploadNominalRollWrapper from "../../../components/uploadWrappers/UploadNominalRollWrapper";
import UploadScriptsWrapper from "../../../components/uploadWrappers/UploadScriptsWrapper";
import UploadScriptTemplateWrapper from "../../../components/uploadWrappers/UploadScriptTemplateWrapper";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4)
    },
    grid: {
      marginTop: theme.spacing(2)
    },
    grow: {
      flexGrow: 1
    },
    button: {
      borderRadius: 24
    }
  })
);

const SetupSubpage: React.FC<RouteComponentProps> = ({ match }) => {
  const history = useHistory();
  const paper = usePaper();
  const classes = useStyles();

  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);
  const [isLoadingScriptTemplate, setIsLoadingScriptTemplate] = useState(true);
  const [refreshScriptTemplateFlag, setRefreshScriptTemplateFlag] = useState(
    true
  );
  const refreshScriptTemplate = () =>
    setRefreshScriptTemplateFlag(!refreshScriptTemplateFlag);

  const getScriptTemplate = async (id: number) => {
    const data = await api.scriptTemplates.getScriptTemplate(id);
    setScriptTemplate(data);
    setIsLoadingScriptTemplate(false);
  };

  useEffect(() => {
    getScriptTemplate(paper.id);
  }, [refreshScriptTemplateFlag]);

  const [scripts, setScripts] = useState<ScriptListData[]>([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);

  const getScripts = async (paperId: number) => {
    const data = await api.scripts.getScripts(paperId);
    if (data) {
      setScripts(data);
    }
    setIsLoadingScripts(false);
  };

  const [refreshScriptsFlag, setRefreshScriptsFlag] = useState(0);
  const refreshScripts = () => {
    setTimeout(() => {
      setRefreshScriptsFlag(refreshScriptsFlag + 1);
    }, 2000);
  };
  useEffect(() => {
    getScripts(paper.id);
  }, [refreshScriptsFlag]);

  const [isOpenEditPaperDialog, setOpenEditPaperDialog] = useState(false);
  const toggleOpenEditPaperDialog = () =>
    setOpenEditPaperDialog(!isOpenEditPaperDialog);

  if (isLoadingScriptTemplate) {
    return <LoadingSpinner loadingMessage="Loading script template..." />;
  } else if (isLoadingScripts) {
    return <LoadingSpinner loadingMessage="Loading scripts..." />;
  }

  const createGridRow = ({ title, button }) => (
    <Grid item xs={12}>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Typography variant="subtitle1" className={classes.grow}>
          {title}
        </Typography>
        {button}
      </Box>
    </Grid>
  );

  const rowDetails = [
    {
      title: "Upload master copy",
      button: (
        <UploadScriptTemplateWrapper
          clickable={!isLoadingScriptTemplate}
          paperId={paper.id}
          setScriptTemplate={setScriptTemplate}
        >
          <Button
            color="primary"
            variant="contained"
            className={classes.button}
          >
            {scriptTemplate ? "Re-Upload" : "Upload"}
          </Button>
        </UploadScriptTemplateWrapper>
      )
    },
    {
      title:
        "Upload student scripts " +
        (scriptTemplate
          ? "(" + scripts.length + " scripts)"
          : " (Upload master copy first)"),
      button: (
        <UploadScriptsWrapper
          paperId={paper.id}
          refreshScripts={refreshScripts}
        >
          <Button
            color="primary"
            variant="contained"
            className={classes.button}
          >
            Upload
          </Button>
        </UploadScriptsWrapper>
      )
    },
    {
      title: "Upload student list / nominal roll",
      button: (
        <UploadNominalRollWrapper
          paperId={paper.id}
          clickable={!isLoadingScriptTemplate}
        >
          <Button
            color="primary"
            variant="contained"
            className={classes.button}
          >
            {false ? "Re-Upload" : "Upload"}
          </Button>
        </UploadNominalRollWrapper>
      )
    },
    {
      title:
        "Map scripts to students" +
        (scripts.length === 0 ? " (Upload scripts first)" : ""),
      button: (
        <Button
          component={Link}
          to={`${match.url}/map`}
          color="primary"
          variant="contained"
          disabled={scripts.length === 0}
          className={classes.button}
        >
          Map
        </Button>
      )
    },
    {
      title:
        "Set up questions" +
        (scriptTemplate ? "" : " (Upload master copy first)"),
      button: (
        <Button
          component={Link}
          to={`${match.url}/template`}
          color="primary"
          variant="contained"
          disabled={isLoadingScriptTemplate || !scriptTemplate}
          className={classes.button}
        >
          Set up
        </Button>
      )
    },
    {
      title:
        "Allocate questions to markers" +
        (scriptTemplate ? "" : " (Upload master copy first)"),
      button: (
        <Button
          component={Link}
          to={`${match.url}/allocate`}
          color="primary"
          variant="contained"
          disabled={isLoadingScriptTemplate || !scriptTemplate}
          className={classes.button}
        >
          Allocate
        </Button>
      )
    }
  ];

  return (
    <Container maxWidth={false} className={classes.container}>
      <Typography variant="h4">Setup</Typography>
      <Grid container spacing={4} className={classes.grid}>
        {rowDetails.map(row => createGridRow(row))}
      </Grid>
    </Container>
  );
};

export default SetupSubpage;