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
import ViewIcon from "mdi-material-ui/FileFind";
import React, { useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { toast } from "react-toastify";
import * as Yup from "yup";
import api from "../../../../api";
import SingleTextfieldForm from "../../../../components/forms/SingleTextfieldForm";
import DeleteScriptModal from "../modals/DeleteScriptModal";
import PickStudentModal from "../modals/PickStudentModal";
import ViewScriptModal from "../modals/ViewScriptModal";
import useStyles from "./styles";
import VerificationSwitch from "./VerificationSwitch";

interface OwnProps {
  script: ScriptListData;
  scriptTemplatePagesCount: number;
  refreshScripts: () => void;
}

type Props = OwnProps & RouteComponentProps;

const ScriptsTableRow: React.FC<Props> = props => {
  const classes = useStyles();
  const { refreshScripts, scriptTemplatePagesCount } = props;

  const [script, setScript] = useState(props.script);

  const patchScript = newValues => {
    newValues.studentId = script.student ? script.student.id : null;
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

  const { filename, student, hasVerifiedStudent, pagesCount } = script;

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
            pagesCount === scriptTemplatePagesCount ? undefined : classes.red
          }
        >
          {pagesCount}
        </Typography>
      </TableCell>
      <TableCell>
        {student ? student.matriculationNumber : "No match found"}
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
          refreshScripts={refreshScripts}
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

export default withRouter(ScriptsTableRow);
