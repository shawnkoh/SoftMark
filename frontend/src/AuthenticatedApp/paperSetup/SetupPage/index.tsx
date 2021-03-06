import { Box, Button, Container, Grid, Typography } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";
import useScriptTemplate from "contexts/ScriptTemplateContext";
import React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
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
  const classes = useStyles();
  const { scriptTemplate } = useScriptTemplate();
  const { scripts } = useScriptsAndStudents();

  const createGridRow = ({ title, button }, key) => (
    <Grid key={key} item xs={12}>
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
      title: "Upload master script",
      button: (
        <UploadScriptTemplateWrapper>
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
        "Upload student scripts · " +
        (scriptTemplate
          ? scripts.length + " scripts"
          : "Upload master script first"),
      button: (
        <UploadScriptsWrapper>
          <Button
            color="primary"
            variant="contained"
            className={classes.button}
            disabled={!scriptTemplate}
          >
            Upload
          </Button>
        </UploadScriptsWrapper>
      )
    },
    {
      title: (
        <>
          Upload student list .csv ([matriculation number], [name], [email]) ·{" "}
          <a href="https://www.dropbox.com/s/5ed14dzpg0sgiwy/NominalRoll.csv?dl=1">
            sample
          </a>
        </>
      ),
      button: (
        <UploadNominalRollWrapper>
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
        "Setup marking template" +
        (scriptTemplate ? "" : " (Upload master script first)"),
      button: (
        <Button
          component={Link}
          to={`${match.url}/template`}
          color="primary"
          variant="contained"
          disabled={!scriptTemplate}
          className={classes.button}
        >
          Set up
        </Button>
      )
    },
    {
      title:
        "Allocate questions to markers" +
        (scriptTemplate ? "" : " (Upload master script first)"),
      button: (
        <Button
          component={Link}
          to={`${match.url}/allocate`}
          color="primary"
          variant="contained"
          disabled={!scriptTemplate}
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
        {rowDetails.map((row, index) => createGridRow(row, index))}
      </Grid>
    </Container>
  );
};

export default SetupSubpage;
