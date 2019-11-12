import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../../api";
import * as Yup from "yup";
import { PaperUserListData } from "../../../types/paperUsers";

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
//import EditStudentModal from "../modals/EditStudentModal";
//import SingleTextfieldForm from "../../../../components/forms/SingleTextfieldForm";
//import DeleteStudentModal from "../modals/DeleteStudentModal";

interface OwnProps {
  index: number;
  marker: PaperUserListData;
  refreshMarkers: () => void;
}

type Props = OwnProps;

const MarkersTableRow: React.FC<Props> = props => {
  const { refreshMarkers, index } = props;
  const [marker, setMarker] = useState(props.marker);
  const { user } = marker;
  const { name, email } = user;

  return (
    <TableRow>
      <TableCell>{index}</TableCell>
      <TableCell>{name ? name : "-"}</TableCell>
      <TableCell>{email}</TableCell>
      <TableCell>
        
      </TableCell>
    </TableRow>
  );
};

/**
 * <EditStudentModal student={marker} callbackStudentData={setMarker} />
        <DeleteStudentModal
          refreshStudents={refreshMarkers}
          student={marker}
        />
 */

export default MarkersTableRow;
