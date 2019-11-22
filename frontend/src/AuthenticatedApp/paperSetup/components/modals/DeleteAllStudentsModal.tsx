import React, { useState, ReactNode } from "react";
import api from "../../../../api";
import { PaperUserListData } from "../../../../types/paperUsers";
import { toast } from "react-toastify";
import ConfirmationDialog from "../../../../components/dialogs/ConfirmationDialog";
import LoadingSpinner from "components/LoadingSpinner";
import usePaper from "contexts/PaperContext";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";

interface OwnProps {
  render: (toggleVisibility: () => void) => ReactNode;
}

type Props = OwnProps;

const DeleteAllStudentsModal: React.FC<Props> = props => {
  const paper = usePaper();
  const { refreshAllStudents } = useScriptsAndStudents();
  const { render } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <ConfirmationDialog
        title={`Delete all students`}
        message={`This action is irreversible. Do you still want to delete?`}
        open={isOpen}
        handleClose={toggleVisibility}
        handleConfirm={async () => {
          toggleVisibility();
          toast(`Attempting to delete all students...`);
          await api.paperUsers
            .discardStudentsOfPaper(paper.id)
            .then(() => {
              toast.success(`Students have been deleted successfully.`);
            })
            .catch(errors => {
              toast.error(`Students could not be deleted.`);
            })
            .finally(refreshAllStudents);
        }}
      />
      {render(toggleVisibility)}
    </>
  );
};

export default DeleteAllStudentsModal;
