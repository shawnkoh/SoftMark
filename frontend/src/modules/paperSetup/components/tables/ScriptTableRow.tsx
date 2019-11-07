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
  Typography
} from "@material-ui/core";
import Clear from "@material-ui/icons/Clear";
import Delete from "@material-ui/icons/Delete";
import Edit from "@material-ui/icons/Edit";
import View from "@material-ui/icons/Search";
import DeleteScriptModal from "../modals/DeleteScriptModal";
import ViewScriptModal from "../modals/ViewScriptModal";
import SingleTextfieldForm from "../../../../components/forms/SingleTextfieldForm";
import useSnackbar from "../../../../components/snackbar/useSnackbar";

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
  refreshScripts: () => void;
}

type Props = OwnProps & RouteComponentProps;

const ScriptsTableRow: React.FC<Props> = props => {
  const snackbar = useSnackbar();
  const classes = useStyles();
  const { refreshScripts } = props;

  const [script, setScript] = useState(props.script);

  const patchScript = newValues => {
    return api.scripts
      .patchScript(script.id, newValues)
      .then(resp => {
        setScript(resp.data.script);
        if (refreshScripts) {
          refreshScripts();
        }
        return false;
      })
      .catch(() => {
        snackbar.showMessage(`Script ${script.filename} could not be updated!`);
        return false;
      });
  };

  const { filename, student, hasVerifiedStudent } = script;

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
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          {student ? student.user.name : "No match found"}
          <Tooltip title={"Change student"}>
            <IconButton>
              <Edit />
            </IconButton>
          </Tooltip>
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
