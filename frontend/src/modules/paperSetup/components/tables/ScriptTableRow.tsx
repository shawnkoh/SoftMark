import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../../../api";
import * as Yup from "yup";
import { ScriptListData } from "backend/src/types/scripts";

import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Grid,
  IconButton,
  TableRow,
  TableCell,
  Tooltip,
  Typography,
  Paper
} from "@material-ui/core";
import Change from "@material-ui/icons/Autorenew";
import Delete from "@material-ui/icons/Delete";
import Edit from "@material-ui/icons/Edit";
import View from "@material-ui/icons/Search";
import DeleteScriptModal from "../modals/DeleteScriptModal";
import PickStudentModal from "../modals/PickStudentModal";
import ViewScriptModal from "../modals/ViewScriptModal";
import SingleTextfieldForm from "../../../../components/forms/SingleTextfieldForm";
import { toast } from "react-toastify";

const useStyles = makeStyles(() => ({
  green: {
    color: "green"
  },
  red: {
    color: "red"
  },
  grey: {
    color: "grey"
  },
  black: {
    color: "black"
  }
}));

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
      <TableCell align="center">
        <Typography
          className={
            pagesCount === scriptTemplatePagesCount
              ? classes.black
              : classes.red
          }
        >
          {pagesCount}
        </Typography>
      </TableCell>
      <TableCell>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          {student ? student.matriculationNumber : "No match found"}
          <PickStudentModal
            callbackScript={setScript}
            script={script}
            render={toggleModal => (
              <Tooltip title={"Change student"}>
                <IconButton onClick={toggleModal}>
                  <Change />
                </IconButton>
              </Tooltip>
            )}
          />
        </Grid>
      </TableCell>
      <TableCell>
        <Grid
          container
          direction="column"
          justify="space-between"
          alignItems="center"
        >
          <Button onClick={() => patchScript({ hasVerifiedStudent: true })}>
            <Typography
              className={hasVerifiedStudent ? classes.green : classes.grey}
            >
              Verified
            </Typography>
          </Button>
          <Button onClick={() => patchScript({ hasVerifiedStudent: false })}>
            <Typography
              className={hasVerifiedStudent ? classes.grey : classes.red}
            >
              Unverified
            </Typography>
          </Button>
        </Grid>
      </TableCell>
      <TableCell>
        <ViewScriptModal
          script={script}
          render={toggleModal => (
            <Tooltip title={"View script"}>
              <IconButton className={classes.black} onClick={toggleModal}>
                <View />
              </IconButton>
            </Tooltip>
          )}
        />
        <DeleteScriptModal
          script={script}
          refreshScripts={refreshScripts}
          render={toggleModal => (
            <Tooltip title={"Delete script"}>
              <IconButton className={classes.red} onClick={toggleModal}>
                <Delete />
              </IconButton>
            </Tooltip>
          )}
        />
      </TableCell>
    </TableRow>
  );
};

export default withRouter(ScriptsTableRow);
