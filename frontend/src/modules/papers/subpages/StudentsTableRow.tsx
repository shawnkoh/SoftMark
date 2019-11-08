import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import * as Yup from "yup";
import { PaperUserListData } from "../../../types/paperUsers";

import { makeStyles } from "@material-ui/core/styles";
import { IconButton, TableRow, TableCell, Tooltip } from "@material-ui/core";
import Rig from "@material-ui/icons/Search";
import RightArrow from "@material-ui/icons/ArrowForwardIos";

interface OwnProps {
  index: number;
  student: PaperUserListData;
}

type Props = OwnProps;

const StudentsTableRow: React.FC<Props> = props => {
  const { index } = props;
  const [student, setStudent] = useState(props.student);
  const { matriculationNumber, user } = student;
  const { name, email } = user;

  return (
    <TableRow>
      <TableCell>{index}</TableCell>
      <TableCell>{matriculationNumber ? matriculationNumber : ""}</TableCell>
      <TableCell>
        {name ? name : "-"}
        <br />
        {email}
      </TableCell>
      <TableCell>Score</TableCell>
      <TableCell>
        <Tooltip title={`View script of ${matriculationNumber}`}>
          <IconButton
            onClick={() => {}} //props.history.push(`scripts/`)}
          >
            <RightArrow />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default StudentsTableRow;
