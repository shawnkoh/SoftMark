import {
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import EditIcon from "@material-ui/icons/Edit";
import React, { useState } from "react";
import { PaperUserListData } from "../../../../types/paperUsers";
import DeleteStudentModal from "../modals/DeleteStudentModal";
import EditStudentModal from "../modals/EditStudentModal";
import useStyles from "./styles";

interface OwnProps {
  student: PaperUserListData;
  matched: boolean;
}

type Props = OwnProps;

const StudentsTableRow: React.FC<Props> = props => {
  const classes = useStyles();
  const { matched } = props;
  const [student, setStudent] = useState(props.student);
  const { matriculationNumber, user } = student;
  const { name, email } = user;

  return (
    <TableRow>
      <TableCell>{matriculationNumber ? matriculationNumber : ""}</TableCell>
      <TableCell>{name ? name : "-"}</TableCell>
      <TableCell>{email}</TableCell>
      <TableCell>
        <Typography className={matched ? classes.green : classes.red}>
          {matched ? "matched" : "unmatched"}
        </Typography>
      </TableCell>
      <TableCell>
        <EditStudentModal
          student={student}
          callbackStudentData={setStudent}
          render={toggleVisibility => (
            <Tooltip title={"Edit student"}>
              <IconButton onClick={toggleVisibility}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
        />
        <DeleteStudentModal
          student={student}
          render={toggleVisibility => (
            <Tooltip title={"Delete student"}>
              <IconButton onClick={toggleVisibility} className={classes.red}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        />
      </TableCell>
    </TableRow>
  );
};

export default StudentsTableRow;
