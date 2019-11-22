import { ScriptListData } from "backend/src/types/scripts";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Button, Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import ConfirmationDialog from "../../../../components/dialogs/ConfirmationDialog";

import api from "../../../../api";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";

interface Props {
  script: ScriptListData;
  render: any;
}

const DeleteScriptModal: React.FC<Props> = props => {
  const { refreshScripts } = useScriptsAndStudents();
  const { script, render } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <ConfirmationDialog
        title={`Delete script "${script.filename}"?`}
        message={`This action is irreversible. Do you still want to delete?`}
        open={isOpen}
        handleClose={toggleVisibility}
        handleConfirm={async () => {
          api.scripts
            .discardScript(script.id)
            .then(() => {
              refreshScripts();
              toggleVisibility();
              toast(`Script ${script.filename} has been deleted successfully.`);
            })
            .catch(errors => {
              toast.error(`Script ${script.filename} could not be deleted.`);
            });
        }}
      />
      {render(toggleVisibility)}
    </>
  );
};

export default DeleteScriptModal;
