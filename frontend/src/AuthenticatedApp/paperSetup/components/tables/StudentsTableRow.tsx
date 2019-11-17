import { IconButton, TableCell, TableRow, Tooltip } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import EditIcon from "@material-ui/icons/Edit";
import React, { useState } from "react";
import { PaperUserListData } from "../../../../types/paperUsers";
import DeleteStudentModal from "../modals/DeleteStudentModal";
import EditStudentModal from "../modals/EditStudentModal";

interface OwnProps {
  student: PaperUserListData;
  refreshStudents: () => void;
}

type Props = OwnProps;

const StudentsTableRow: React.FC<Props> = props => {
  const { refreshStudents } = props;
  const [student, setStudent] = useState(props.student);
  const { matriculationNumber, user } = student;
  const { name, email } = user;

  return (
    <TableRow>
      <TableCell>{matriculationNumber ? matriculationNumber : ""}</TableCell>
      <TableCell>{name ? name : "-"}</TableCell>
      <TableCell>{email}</TableCell>
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
          refreshStudents={refreshStudents}
          student={student}
          render={toggleVisibility => (
            <Tooltip title={"Delete student"}>
              <IconButton onClick={toggleVisibility} color="secondary">
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
