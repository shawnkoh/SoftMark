import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";
import React, { ReactNode, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../../api";
import ConfirmationDialog from "../../../../components/dialogs/ConfirmationDialog";
import { StudentListData } from "../../../../types/paperUsers";

interface OwnProps {
  student: StudentListData;
  render: (toggleVisibility: () => void) => ReactNode;
}

type Props = OwnProps;

const DeleteStudentModal: React.FC<Props> = props => {
  const {
    refreshAllStudents,
    refreshUnmatchedStudents
  } = useScriptsAndStudents();
  const { student, render } = props;
  const { name, matriculationNumber } = student;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <ConfirmationDialog
        title={`Delete student "${name} (${matriculationNumber})"?`}
        message={`This action is irreversible. Do you still want to delete?`}
        open={isOpen}
        handleClose={toggleVisibility}
        handleConfirm={async () => {
          api.paperUsers
            .discardPaperUser(student.id)
            .then(() => {
              toast.success(`Student ${name} has been deleted successfully.`);
              refreshAllStudents();
              refreshUnmatchedStudents();
            })
            .catch(errors => {
              toast.error(`Student ${name} could not be deleted.`);
            });
          toggleVisibility();
        }}
      />
      {render(toggleVisibility)}
    </>
  );
};

export default DeleteStudentModal;
