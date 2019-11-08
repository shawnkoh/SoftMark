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
import { PaperUserListData } from "../../../../types/paperUsers";
import { toast } from "react-toastify";
import ThemedButton from "../../../../components/buttons/ThemedButton";
import ConfirmationDialog from "../../../../components/dialogs/ConfirmationDialog";

interface OwnProps {
  students: PaperUserListData[];
  refreshStudents?: () => void;
}

type Props = OwnProps;

const DeleteAllStudentsModal: React.FC<Props> = props => {
  const { students, children, refreshStudents } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <ConfirmationDialog
        title={`Delete all students.`}
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
      <ThemedButton label="Clear" filled onClick={toggleVisibility} />
    </>
  );
};

export default DeleteAllStudentsModal;
