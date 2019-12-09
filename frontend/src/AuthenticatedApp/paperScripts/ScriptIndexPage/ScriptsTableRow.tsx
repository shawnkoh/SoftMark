import {
  Button,
  Chip,
  Container,
  TableCell,
  TableRow,
  Tooltip
} from "@material-ui/core";
import CancelRounded from "@material-ui/icons/CancelRounded";
import CheckRounded from "@material-ui/icons/CheckRounded";
import { ScriptListData } from "backend/src/types/scripts";
import useScriptTemplate from "contexts/ScriptTemplateContext";
import React from "react";
import { useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import MarkWhichQuestionModal from "./MarkWhichQuestionModal";
import useStyles from "./styles";
import { QuestionTemplate } from "./types";

interface Props {
  script: ScriptListData;
  questionTemplates: QuestionTemplate[];
}

const ScriptsTableRow: React.FC<Props> = props => {
  const { script, questionTemplates } = props;
  const classes = useStyles();
  const { scriptTemplate } = useScriptTemplate();
  const totalMarks = scriptTemplate ? scriptTemplate.totalMarks : 0;
  const { url } = useRouteMatch()!;

  const {
    completedMarking,
    filename,
    id,
    matriculationNumber,
    publishedDate,
    studentEmail,
    studentName,
    totalScore
  } = script;

  return (
    <TableRow>
      <TableCell>{id}</TableCell>
      <TableCell>{filename}</TableCell>
      <TableCell>{matriculationNumber || "-"}</TableCell>
      <TableCell>
        {studentName || "-"}
        <br />
        {studentEmail}
      </TableCell>
      <TableCell>
        <Chip
          label={`${totalScore} / ${totalMarks}`}
          color={completedMarking ? "secondary" : "default"}
        />
      </TableCell>
      <TableCell>
        <Container>
          {publishedDate ? (
            <CheckRounded color="secondary" />
          ) : (
            <CancelRounded color="error" />
          )}
        </Container>
      </TableCell>
      <TableCell>
        <Tooltip title={`Mark script of ${matriculationNumber || "-"}`}>
          <MarkWhichQuestionModal
            baseUrl={`${url}/${id}/mark`}
            questionTemplates={questionTemplates}
            render={toggleVisibility => (
              <Button
                onClick={toggleVisibility}
                variant="contained"
                color="primary"
                className={classes.button}
              >
                Mark
              </Button>
            )}
          />
        </Tooltip>
        <Tooltip title={`View script of ${matriculationNumber || "-"}`}>
          <Button
            component={Link}
            to={`${url}/${id}`}
            variant="contained"
            color="primary"
            className={classes.button}
          >
            View
          </Button>
        </Tooltip>
        <Tooltip title={`Export script of ${matriculationNumber || "-"}`}>
          <Button
            component={Link}
            to={`${url}/${id}/save_script`}
            variant="contained"
            color="primary"
            className={classes.button}
          >
            Export
          </Button>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default ScriptsTableRow;
