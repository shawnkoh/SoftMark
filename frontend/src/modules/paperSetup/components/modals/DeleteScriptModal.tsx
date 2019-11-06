import React, { useState, useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import api from "../../../../api";
import { Button, Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import { ScriptListData } from "backend/src/types/scripts";
import useSnackbar from "../../../../components/snackbar/useSnackbar";

interface OwnProps {
  script: ScriptListData;
  children: (f: () => void) => React.FC;
  refreshScripts?: () => void;
}

type Props = OwnProps;

const DeleteScriptModal: React.FC<Props> = props => {
  const snackbar = useSnackbar();
  const { script, children, refreshScripts } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <Dialog open={isOpen} fullWidth onBackdropClick={toggleVisibility}>
        <DialogTitle>{`Delete script ${script.filename}`}</DialogTitle>
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
                  snackbar.showMessage(
                    `Script ${script.filename} has been deleted successfully.`
                  );
                })
                .catch(errors => {
                  snackbar.showMessage(
                    `Script ${script.filename} could not be deleted.`,
                    "Close"
                  );
                });
            }}
          >
            Discard
          </Button>
        </DialogContent>
      </Dialog>
      {children(toggleVisibility)}
    </>
  );
};

export default withRouter(DeleteScriptModal);
