import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import * as Yup from "yup";
import { PaperUserListData } from "../../../types/paperUsers";
import { ScriptListData } from "backend/src/types/scripts";

import { makeStyles } from "@material-ui/core/styles";
import { IconButton, TableRow, TableCell, Tooltip } from "@material-ui/core";
import Rig from "@material-ui/icons/Search";
import RightArrow from "@material-ui/icons/ArrowForwardIos";

interface OwnProps {
  script: ScriptListData;
}

type Props = OwnProps & RouteComponentProps;

const ScriptsTableRow: React.FC<Props> = props => {
  const { script } = props;
  const {student, filename, id, awardedMarks, totalMarks} = script;
  let matriculationNumber = "-";
  let name ="-";
  let email ="";
  if(student){
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
          <IconButton
            onClick={() => props.history.push(`scripts/${id}/view`)}
          >
            <RightArrow />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default withRouter(ScriptsTableRow);
