import {
  Button,
  Container,
  TableCell,
  TableRow,
  Tooltip
} from "@material-ui/core";
import CancelRounded from "@material-ui/icons/CancelRounded";
import CheckRounded from "@material-ui/icons/CheckRounded";
import { ScriptListData } from "backend/src/types/scripts";
import useScriptTemplate from "contexts/ScriptTemplateContext";
import React, { useState } from "react";
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
  const classes = useStyles();
  const { scriptTemplate } = useScriptTemplate();
  const totalMarks = scriptTemplate ? scriptTemplate.totalMarks : 0;
  const { url } = useRouteMatch()!;

  const [script, setScript] = useState(props.script);
  const { student, filename, id, awardedMarks, hasBeenPublished } = script;
  let matriculationNumber = "-";
  let name = "-";
  let email = "";
  if (student) {
    matriculationNumber = student.matriculationNumber || matriculationNumber;
    const { user } = student;
    name = user.name || name;
    email = user.email;
  }

  return (
    <TableRow>
      <TableCell>{id}</TableCell>
      <TableCell>{filename}</TableCell>
      <TableCell>{matriculationNumber}</TableCell>
      <TableCell>
        {name}
        <br />
        {email}
      </TableCell>
      <TableCell>{`${awardedMarks} / ${totalMarks}`}</TableCell>
      <TableCell>
        <Container>
          {hasBeenPublished ? (
            <CheckRounded color="secondary" />
          ) : (
            <CancelRounded color="error" />
          )}
        </Container>
      </TableCell>
      <TableCell>
        <Tooltip title={`Mark script of ${matriculationNumber}`}>
          <MarkWhichQuestionModal
            baseUrl={`${url}/${id}/mark`}
            questionTemplates={props.questionTemplates}
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
        <Tooltip title={`View script of ${matriculationNumber}`}>
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
        <Tooltip title={`Download script of ${matriculationNumber}`}>
          <Button
            component={Link}
            to={`${url}/${id}/save_script`}
            variant="contained"
            color="primary"
            className={classes.button}
          >
            Download
          </Button>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default ScriptsTableRow;
