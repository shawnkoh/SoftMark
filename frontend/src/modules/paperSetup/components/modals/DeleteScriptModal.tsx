<<<<<<< 7439ecfcffe4602e8b390d255f454936bbf77f2b
=======
import React, { useState, useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import api from "../../../../api";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid
} from "@material-ui/core";
>>>>>>> Fix some bugs on scripts table
import { ScriptListData } from "backend/src/types/scripts";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Button, Dialog, DialogContent, DialogTitle } from "@material-ui/core";

import api from "../../../../api";

interface Props {
  script: ScriptListData;
  render: any;
  refreshScripts?: () => void;
}

const DeleteScriptModal: React.FC<Props> = props => {
  const { script, render, refreshScripts } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <Dialog open={isOpen} fullWidth onBackdropClick={toggleVisibility}>
        <DialogTitle>{`Delete script "${script.filename}".`}</DialogTitle>
        <DialogContent>
          <Button color="primary" onClick={toggleVisibility}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={async () => {
              api.scripts
                .discardScript(script.id)
                .then(() => {
                  if (refreshScripts) {
                    refreshScripts();
                  }
                  toast(
                    `Script ${script.filename} has been deleted successfully.`
                  );
                })
                .catch(errors => {
                  toast.error(
                    `Script ${script.filename} could not be deleted.`
                  );
                });
            }}
          >
            Discard
          </Button>
        </DialogContent>
      </Dialog>
      {render(toggleVisibility)}
    </>
  );
};

export default DeleteScriptModal;
