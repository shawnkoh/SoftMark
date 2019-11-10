import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../../../api";
import * as Yup from "yup";
import { PaperUserListData } from "../../../../types/paperUsers";

import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Grid,
  IconButton,
  TableRow,
  TableCell,
  Tooltip,
  Typography
} from "@material-ui/core";
import Delete from "@material-ui/icons/Delete";
import View from "@material-ui/icons/Search";
import EditStudentModal from "../modals/EditStudentModal";
import SingleTextfieldForm from "../../../../components/forms/SingleTextfieldForm";
import DeleteStudentModal from "../modals/DeleteStudentModal";

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
        <EditStudentModal student={student} callbackStudentData={setStudent} />
        <DeleteStudentModal
          refreshStudents={refreshStudents}
          student={student}
        />
      </TableCell>
    </TableRow>
  );
};

export default StudentsTableRow;
