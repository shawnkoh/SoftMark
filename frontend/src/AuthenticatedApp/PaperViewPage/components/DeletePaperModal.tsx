import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import api from "../../../api";
import CustomDialogTitle from "../../../components/dialogs/DialogTitleWithCloseButton";
import usePaper from "../../../contexts/PaperContext";

interface Props {
  render: any;
}

const DeletePaperModal: React.FC<Props> = props => {
  const { render } = props;
  const history = useHistory();
  const paper = usePaper();
  const { id, name } = paper;

  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const [text, setText] = useState<string>("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };
  useEffect(() => {
    if (!isOpen) setText("");
  }, [isOpen]);

  const handleDelete = () => {
    api.papers
      .discardPaper(id)
      .then(() => {
        toast.success(`${name} has been deleted successfully.`);
        history.push(`/`);
      })
      .catch(errors => {
        toast.error(`${name} could not be deleted.`);
      });
    toggleVisibility();
  };

  return (
    <>
      <Dialog open={isOpen} onClose={toggleVisibility}>
        <CustomDialogTitle id="alert-dialog-title" onClose={toggleVisibility}>
          Delete {name} paper
        </CustomDialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            This action is irreversible! Do you want to delete the {name} paper?
          </DialogContentText>
          <TextField
            label={`Enter "${paper.name}" here`}
            margin="normal"
            variant="outlined"
            value={text}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleVisibility} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={text !== name}
            color="primary"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {render(toggleVisibility)}
    </>
  );
};

export default DeletePaperModal;
