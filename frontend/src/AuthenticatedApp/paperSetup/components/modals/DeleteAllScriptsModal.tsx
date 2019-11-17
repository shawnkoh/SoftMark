import { ScriptListData } from "backend/src/types/scripts";
import React, { ReactNode, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../../api";
import ConfirmationDialog from "../../../../components/dialogs/ConfirmationDialog";

interface OwnProps {
  scripts: ScriptListData[];
  refreshScripts?: () => void;
  render: (toggleVisibility: () => void) => ReactNode;
}

type Props = OwnProps;

const DeleteAllScriptsModal: React.FC<Props> = props => {
  const { scripts, refreshScripts, render } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <ConfirmationDialog
        title={`Delete all scripts`}
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
      {render(toggleVisibility)}
    </>
  );
};

export default DeleteAllScriptsModal;
