import React, { useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api";

import { ScriptListData } from "backend/src/types/scripts";

import { Button, Grid, TableRow, TableCell, Tooltip } from "@material-ui/core";
import VerificationSwitch from "../../../components/misc/VerificationSwitch";
import useStyles from "./styles";

interface OwnProps {
  script: ScriptListData;
}

type Props = OwnProps & RouteComponentProps;

const ScriptsTableRow: React.FC<Props> = props => {
  const classes = useStyles();
  const { match } = props;

  const [script, setScript] = useState(props.script);
  const {
    student,
    filename,
    id,
    awardedMarks,
    totalMarks,
    hasBeenPublished
  } = script;
  let matriculationNumber = "-";
  let name = "-";
  let email = "";
  if (student) {
    matriculationNumber = student.matriculationNumber || matriculationNumber;
    const { user } = student;
    name = user.name || name;
    email = user.email;
  }

  const patchScript = newValues => {
    newValues.studentId = script.student ? script.student.id : null;
    return api.scripts
      .patchScript(script.id, newValues)
      .then(resp => {
        setScript(resp.data.script);
      })
      .catch(() => {
        toast.error(`Script ${script.filename} could not be updated!`);
      });
  };

  return (
    <TableRow>
      <TableCell>{filename}</TableCell>
      <TableCell>{matriculationNumber}</TableCell>
      <TableCell>
        {name}
        <br />
        {email}
      </TableCell>
      <TableCell>{`${awardedMarks} / ${totalMarks}`}</TableCell>
      <TableCell>
        <Grid component="label" container alignItems="center" spacing={1}>
          <Grid item className={hasBeenPublished ? undefined : classes.red}>
            Unpublished
          </Grid>
          <Grid item>
            <VerificationSwitch
              color="primary"
              checked={hasBeenPublished}
              onChange={event =>
                patchScript({ hasBeenPublished: event.target.checked })
              }
              value="verified"
            />
          </Grid>
          <Grid item className={hasBeenPublished ? classes.green : undefined}>
            Published
          </Grid>
        </Grid>
      </TableCell>
      <TableCell>
        <Tooltip title={`Mark script of ${matriculationNumber}`}>
          <Button
            component={Link}
            to={`${match.url}/${id}/mark`}
            variant="contained"
            color="primary"
            style={{ borderRadius: 24 }}
          >
            Mark
          </Button>
        </Tooltip>
        <Tooltip title={`View script of ${matriculationNumber}`}>
          <Button
            component={Link}
            to={`${match.url}/${id}`}
            variant="contained"
            color="primary"
            style={{ borderRadius: 24 }}
          >
            View
          </Button>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default withRouter(ScriptsTableRow);
