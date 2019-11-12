import { Box, Container, Grid, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { ScriptListData } from "backend/src/types/scripts";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import api from "../../../api";
import { RoundedButton } from "../../../components/buttons/StyledButtons";
import LoadingSpinner from "../../../components/LoadingSpinner";
import UploadNominalRollWrapper from "../../../components/uploadWrappers/UploadNominalRollWrapper";
import UploadScriptsWrapper from "../../../components/uploadWrappers/UploadScriptsWrapper";
import UploadScriptTemplateWrapper from "../../../components/uploadWrappers/UploadScriptTemplateWrapper";
import usePaper from "../../../contexts/PaperContext";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4)
    },
    grow: {
      flexGrow: 1
    }
  })
);

const BULLET_POINT = `\u2022 `;

const SetupSubpage: React.FC = () => {
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
          <RoundedButton color="primary" variant="contained">
            {scriptTemplate ? "Re-Upload" : "Upload"}
          </RoundedButton>
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
          <RoundedButton color="primary" variant="contained">
            Upload
          </RoundedButton>
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
          <RoundedButton color="primary" variant="contained">
            {false ? "Re-Upload" : "Upload"}
          </RoundedButton>
        </UploadNominalRollWrapper>
      )
    },
    {
      title:
        "Map student scripts to student list / nominal roll" +
        (scripts.length === 0 ? " (Upload student scripts first)" : ""),
      button: (
        <RoundedButton
          color="primary"
          variant="contained"
          disabled={scripts.length === 0}
          onClick={() =>
            history.push(`/papers/${paper.id}/set_up/script_mapping`)
          }
        >
          Map
        </RoundedButton>
      )
    },
    {
      title:
        "Set up marking template" +
        (scriptTemplate ? "" : " (Upload master copy first)"),
      button: (
        <RoundedButton
          color="primary"
          variant="contained"
          disabled={isLoadingScriptTemplate || !scriptTemplate}
          onClick={() => {
            if (scriptTemplate) {
              history.push(`/papers/${paper.id}/set_up/script_template`);
            }
          }}
        >
          Set up
        </RoundedButton>
      )
    },
    {
      title:
        "Allocate questions to markers" +
        (scriptTemplate ? "" : " (Upload master copy first)"),
      button: (
        <RoundedButton
          color="primary"
          variant="contained"
          disabled={isLoadingScriptTemplate || !scriptTemplate}
          onClick={() =>
            history.push(`/papers/${paper.id}/set_up/script_template`)
          }
        >
          Allocate
        </RoundedButton>
      )
    }
  ];

  return (
    <>
      <Container maxWidth={false}>
        <Grid container spacing={4} className={classes.container}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h2">
              Setup
            </Typography>
          </Grid>
          {rowDetails.map(row => createGridRow(row))}
        </Grid>
      </Container>
    </>
  );
};

export default SetupSubpage;
