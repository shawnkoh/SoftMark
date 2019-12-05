import {
  Grid,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import EditIcon from "@material-ui/icons/Edit";
import { ScriptListData } from "backend/src/types/scripts";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";
import ViewIcon from "mdi-material-ui/FileFind";
import React, { useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import api from "../../../../api";
import SingleTextfieldForm from "../../../../components/forms/SingleTextfieldForm";
import VerificationSwitch from "../../../../components/misc/VerificationSwitch";
import DeleteScriptModal from "../modals/DeleteScriptModal";
import PickStudentModal from "../modals/PickStudentModal";
import ViewScriptModal from "../modals/ViewScriptModal";
import useStyles from "./styles";

interface Props {
  script: ScriptListData;
  scriptTemplatePagesCount: number;
}

const ScriptsTableRow: React.FC<Props> = props => {
  const classes = useStyles();
  const { scriptTemplatePagesCount } = props;

  const [script, setScript] = useState<ScriptListData>(props.script);

  const patchScript = newValues => {
    newValues.studentId = studentId || null;
    return api.scripts
      .patchScript(script.id, newValues)
      .then(resp => {
        setScript(resp.data.script);
        return false;
      })
      .catch(() => {
        toast.error(`Script ${script.filename} could not be updated!`);
        return false;
      });
  };

  const {
    filename,
    studentId,
    hasVerifiedStudent,
    pageCount,
    matriculationNumber
  } = script;

  return (
    <TableRow>
      <TableCell>
        <SingleTextfieldForm
          fieldName="filename"
          initialText={filename}
          validationSchema={Yup.object({
            filename: Yup.string().required("Filename is required")
          })}
          onSubmit={patchScript}
        />
      </TableCell>
      <TableCell>
        <Typography
          className={
            pageCount === scriptTemplatePagesCount ? undefined : classes.red
          }
        >
          {pageCount}
        </Typography>
      </TableCell>
      <TableCell>
        {studentId ? matriculationNumber : "No match found"}
        <PickStudentModal
          callbackScript={setScript}
          script={script}
          render={toggleModal => (
            <Tooltip title={"Change student"}>
              <IconButton onClick={toggleModal}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
        />
      </TableCell>
      <TableCell>
        <Grid component="label" container alignItems="center" spacing={1}>
          <Grid item className={hasVerifiedStudent ? undefined : classes.red}>
            Unverified
          </Grid>
          <Grid item>
            <VerificationSwitch
              color="primary"
              checked={hasVerifiedStudent}
              onChange={event =>
                patchScript({ hasVerifiedStudent: event.target.checked })
              }
              value="verified"
            />
          </Grid>
          <Grid item className={hasVerifiedStudent ? classes.green : undefined}>
            Verified
          </Grid>
        </Grid>
      </TableCell>
      <TableCell>
        <ViewScriptModal
          script={script}
          render={toggleModal => (
            <Tooltip title={"View script"}>
              <IconButton color="default" onClick={toggleModal}>
                <ViewIcon />
              </IconButton>
            </Tooltip>
          )}
        />
        <DeleteScriptModal
          script={script}
          render={toggleModal => (
            <Tooltip title={"Delete script"}>
              <IconButton onClick={toggleModal} className={classes.red}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        />
      </TableCell>
    </TableRow>
  );
};

export default ScriptsTableRow;
