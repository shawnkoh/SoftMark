import React, { useState, ReactNode } from "react";
import api from "../../../../api";
import { PaperUserListData } from "../../../../types/paperUsers";
import { toast } from "react-toastify";
import ConfirmationDialog from "../../../../components/dialogs/ConfirmationDialog";

interface OwnProps {
  students: PaperUserListData[];
  refreshStudents?: () => void;
  render: (toggleVisibility: () => void) => ReactNode;
}

type Props = OwnProps;

const DeleteAllStudentsModal: React.FC<Props> = props => {
  const { students, refreshStudents, render } = props;
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
          await Promise.all(
            students.map(student => {
              api.paperUsers
                .discardPaperUser(student.id)
                .then(() => {
                  toast.success(
                    `Student ${student.user.name} has been deleted successfully.`
                  );
                })
                .catch(errors => {
                  toast.error(
                    `Script ${student.user.name} could not be deleted.`
                  );
                });
            })
          );
          if (refreshStudents) {
            refreshStudents();
          }
          toggleVisibility();
        }}
      />
      {render(toggleVisibility)}
    </>
  );
};

export default DeleteAllStudentsModal;
