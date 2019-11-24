import React, { ReactNode, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../../api";
import usePaper from "contexts/PaperContext";
import ConfirmationDialog from "../../../../components/dialogs/ConfirmationDialog";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";

interface OwnProps {
  render: (toggleVisibility: () => void) => ReactNode;
}

type Props = OwnProps;

const DeleteAllScriptsModal: React.FC<Props> = props => {
  const paper = usePaper();
  const { refreshScripts } = useScriptsAndStudents();
  const { render } = props;
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
              refreshScripts();
            });
        }}
      />
      {render(toggleVisibility)}
    </>
  );
};

export default DeleteAllScriptsModal;
