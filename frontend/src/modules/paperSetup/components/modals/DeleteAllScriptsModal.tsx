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
import { ScriptListData } from "backend/src/types/scripts";
import { toast } from "react-toastify";
import ThemedButton from "../../../../components/buttons/ThemedButton";
import ConfirmationDialog from "../../../../components/dialogs/ConfirmationDialog";

interface OwnProps {
  scripts: ScriptListData[];
  refreshScripts?: () => void;
}

type Props = OwnProps;

const DeleteAllScriptsModal: React.FC<Props> = props => {
  const { scripts, children, refreshScripts } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <ConfirmationDialog
        title={`Delete all scripts.`}
        message={`This action is irreversible. Do you still want to delete?`}
        open={isOpen}
        handleClose={toggleVisibility}
        handleConfirm={async () => {
          await Promise.all(
            scripts.map(script => {
              api.scripts
                .discardScript(script.id)
                .then(() => {
                  toast.success(
                    `Script ${script.filename} has been deleted successfully.`
                  );
                })
                .catch(errors => {
                  toast.error(
                    `Script ${script.filename} could not be deleted.`
                  );
                });
            })
          );
          if (refreshScripts) {
            refreshScripts();
          }
          toggleVisibility();
        }}
      />
      <ThemedButton label="Clear" filled onClick={toggleVisibility} />
    </>
  );
};

export default DeleteAllScriptsModal;
