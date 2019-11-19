import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";

import { ScriptListData } from "backend/src/types/scripts";

import { Button, TableRow, TableCell, Tooltip } from "@material-ui/core";

interface OwnProps {
  script: ScriptListData;
}

type Props = OwnProps & RouteComponentProps;

const ScriptsTableRow: React.FC<Props> = props => {
  const { script, match } = props;
  const { student, filename, id, awardedMarks, totalMarks } = script;
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
      <TableCell>{filename}</TableCell>
      <TableCell>{matriculationNumber}</TableCell>
      <TableCell>
        {name}
        <br />
        {email}
      </TableCell>
      <TableCell>{`${awardedMarks} / ${totalMarks}`}</TableCell>
      <TableCell>
        <Tooltip title={`View script of ${matriculationNumber}`}>
          <Button
            component={Link}
            to={`${match.url}/${id}`}
            variant="contained"
            color="primary"
          >
            View
          </Button>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default withRouter(ScriptsTableRow);
