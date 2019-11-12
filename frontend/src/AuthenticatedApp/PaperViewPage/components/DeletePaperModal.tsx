import React, { useState, useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import api from "../../../api";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid
} from "@material-ui/core";
import Clear from "@material-ui/icons/Clear";
import { PaperListData } from "backend/src/types/papers";
import { toast } from "react-toastify";
import ConfirmationDialog from "../../../components/dialogs/ConfirmationDialog";

interface OwnProps {
  paper: PaperListData;
  render: any;
}

type Props = RouteComponentProps & OwnProps;

const DeleteStudentModal: React.FC<Props> = props => {
  const { render, paper } = props;
  const { name } = paper;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <ConfirmationDialog
        title={`Delete paper "${name}".`}
        message={`This action is irreversible. Do you still want to delete?`}
        open={isOpen}
        handleClose={toggleVisibility}
        handleConfirm={async () => {
          api.papers
            .discardPaper(paper.id)
            .then(() => {
              toast.success(`Paper "${name}" has been deleted successfully.`);
              props.history.push(`/`);
            })
            .catch(errors => {
              toast.error(`Paper "${name}" could not be deleted.`);
            });
          toggleVisibility();
        }}
      />
      {render(toggleVisibility)}
    </>
  );
};

export default withRouter(DeleteStudentModal);
