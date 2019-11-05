import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import api from "../../../api";
import { Button, Grid, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Edit from "@material-ui/icons/EditOutlined";
import { DropAreaBase } from "material-ui-file-dropzone";
import { PaperData } from "backend/src/types/papers";
import EditPaperModal from "../components/modals/EditPaperModal";
import ThemedButton from "../../../components/buttons/ThemedButton";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import { ScriptListData } from "backend/src/types/scripts";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";
import useSnackbar from "../../../components/snackbar/useSnackbar";
import ArrowLeftSharp from "@material-ui/icons/ArrowLeftSharp";
import UploadNominalRollWrapper from "../../../components/uploadWrappers/UploadNominalRollWrapper";
import UploadScriptTemplateWrapper from "../../../components/uploadWrappers/UploadScriptTemplateWrapper";
import UploadScriptsWrapper from "../../../components/uploadWrappers/UploadScriptsWrapper";

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: 20,
    marginLeft: 100,
    marginRight: 100,
    minWidth: 500,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3), // padding between content and top and side bars
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  divider: {
    marginTop: 50
  }
}));

const BULLET_POINT = `\u2022 `;

interface OwnProps {
  paper: PaperData;
  toggleRefresh: () => void;
}

type Props = OwnProps & RouteComponentProps;

const SetupPage: React.FC<Props> = props => {
  const { paper, toggleRefresh } = props;
  const classes = useStyles();
  const snackbar = useSnackbar();

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

  useEffect(() => {
    api.scriptTemplates
      .getScriptTemplate(paper.id)
      .then(resp => {
        setScriptTemplate(resp.data.scriptTemplate);
      })
      .finally(() => setIsLoadingScriptTemplate(false));
  }, [refreshScriptTemplateFlag]);

  const [scripts, setScripts] = useState<ScriptListData[]>([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);
  const [refreshScriptsFlag, setRefreshScriptsFlag] = useState(true);
  const refreshScripts = () => setRefreshScriptsFlag(!refreshScriptsFlag);
  useEffect(() => {
    api.scripts
      .getScripts(paper.id)
      .then(resp => {
        setScripts(resp.data.scripts);
      })
      .finally(() => setIsLoadingScripts(false));
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
    <Grid
      item
      container
      direction="row"
      justify="space-between"
      alignItems="center"
    >
      <Grid item xs={6}>
        <Typography variant="h6">{title}</Typography>
      </Grid>
      <Grid item xs={3} container direction="row" justify="flex-end">
        {button}
      </Grid>
    </Grid>
  );

  const rowDetails = [
    {
      title: "Script master copy",
      button: (
        <UploadScriptTemplateWrapper
          clickable={!isLoadingScriptTemplate}
          paperId={paper.id}
          setScriptTemplate={setScriptTemplate}
        >
          <Button>{scriptTemplate ? "Re-Upload" : "Upload"}</Button>
        </UploadScriptTemplateWrapper>
      )
    },
    {
      title:
        "Template" +
        (scriptTemplate ? "" : " (Upload script master copy first)"),
      button: (
        <Button
          disabled={isLoadingScriptTemplate || !scriptTemplate}
          onClick={() => {
            if (scriptTemplate) {
              props.history.push(`/papers/${paper.id}/set_up/script_template`);
            }
          }}
        >
          Set up
        </Button>
      )
    },
    {
      title:
        "Question allocation" +
        (scriptTemplate ? "" : " (Upload script master copy first)"),
      button: (
        <Button
          disabled={isLoadingScriptTemplate || !scriptTemplate}
          onClick={() =>
            props.history.push(`/papers/${paper.id}/set_up/question_allocation`)
          }
        >
          Allocate
        </Button>
      )
    },
    {
      title: "Student list",
      button: (
        <UploadNominalRollWrapper clickable={!isLoadingScriptTemplate}>
          <Button>{false ? "Re-Upload" : "Upload"}</Button>
        </UploadNominalRollWrapper>
      )
    },
    {
      title:
        "Scripts " +
        (scriptTemplate
          ? "(" + scripts.length + " scripts)"
          : " (Upload script master copy first)"),
      button: (
        <UploadScriptsWrapper
          paperId={paper.id}
          refreshScripts={refreshScripts}
        >
          <Button variant="outlined" fullWidth>
            Upload
          </Button>
        </UploadScriptsWrapper>
      )
    },
    {
      title:
        "Mapping of scripts to nominal roll" +
        (scripts.length === 0 ? " (Upload scripts)" : ""),
      button: (
        <Button
          disabled={scripts.length === 0}
          onClick={() =>
            props.history.push(`/papers/${paper.id}/set_up/script_mapping`)
          }
        >
          View
        </Button>
      )
    }
  ];

  return (
    <>
      <main className={classes.content}>
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="center"
          spacing={2}
        >
          <Grid
            key={paper.id}
            item
            xs={12}
            container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
            spacing={1}
          >
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <IconButton onClick={() => props.history.push("/papers")}>
                <ArrowLeftSharp />
              </IconButton>
              <Typography variant="h4">{paper.name}</Typography>
              <EditPaperModal
                paper={paper}
                visible={isOpenEditPaperDialog}
                toggleVisibility={toggleOpenEditPaperDialog}
                toggleRefresh={toggleRefresh}
              />
              <IconButton onClick={toggleOpenEditPaperDialog}>
                <Edit />
              </IconButton>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1">
                {!scriptTemplate && (
                  <>
                    {`${BULLET_POINT} Upload script template`}
                    <br />
                  </>
                )}
                {true && (
                  <>
                    {`${BULLET_POINT} Set up template`}
                    <br />
                  </>
                )}
                {true && (
                  <>
                    {`${BULLET_POINT} Allocate questions`}
                    <br />
                  </>
                )}
                {scripts.length === 0 && (
                  <>
                    {`${BULLET_POINT} Upload scripts`}
                    <br />
                  </>
                )}
              </Typography>
            </Grid>
          </Grid>
          <div className={classes.divider} />
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="center"
            spacing={4}
          >
            {rowDetails.map(row => createGridRow(row))}
          </Grid>
        </Grid>
      </main>
    </>
  );
};

export default withRouter(SetupPage);
