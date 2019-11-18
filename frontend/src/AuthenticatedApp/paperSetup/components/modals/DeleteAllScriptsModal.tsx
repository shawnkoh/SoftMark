import { ScriptListData } from "backend/src/types/scripts";
import React, { ReactNode, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../../api";
import usePaper from "contexts/PaperContext";
import ConfirmationDialog from "../../../../components/dialogs/ConfirmationDialog";

interface OwnProps {
  refreshScripts?: () => void;
  render: (toggleVisibility: () => void) => ReactNode;
}

type Props = OwnProps;

const DeleteAllScriptsModal: React.FC<Props> = props => {
  const paper = usePaper();
  const { refreshScripts, render } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <ConfirmationDialog
        title={`Delete all scripts`}
        message={`This action is irreversible. Do you still want to delete?`}
        open={isOpen}
        handleClose={toggleVisibility}
        handleConfirm={() => {
          toggleVisibility();
          toast("Attempting to delete scripts...");
          api.scripts
            .discardScripts(paper.id)
            .then(() => {
              toast.success(`Scripts have been deleted successfully.`);
            })
            .catch(errors => {
              toast.error(`Scripts could not be deleted.`);
            })
            .finally(() => {
              if (refreshScripts) {
                refreshScripts();
              }
            });
        }}
      />
      {render(toggleVisibility)}
    </>
  );
};

export default DeleteAllScriptsModal;
