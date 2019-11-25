import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  List,
  ListItem,
  ListItemText
} from "@material-ui/core";
import React, { useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import CustomDialogTitle from "../../../components/dialogs/DialogTitleWithCloseButton";
import { QuestionTemplate } from "./types";

interface Props {
  baseUrl: string;
  questionTemplates: QuestionTemplate[];
  render: (toggleVisibility: () => void) => ReactNode;
}

const MarkWhichQuestionModal: React.FC<Props> = props => {
  const { baseUrl, questionTemplates, render } = props;

  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <Dialog open={isOpen} onClose={toggleVisibility} fullWidth>
        <CustomDialogTitle id="alert-dialog-title" onClose={toggleVisibility}>
          Mark which question?
        </CustomDialogTitle>
        <List>
          {questionTemplates.map((questionTemplate, index) => (
            <ListItem
              key={index}
              button
              component={Link}
              to={`${baseUrl}/${questionTemplate.id}`}
            >
              <ListItemText primary={"Q" + questionTemplate.name} />
            </ListItem>
          ))}
        </List>
      </Dialog>
      {render(toggleVisibility)}
    </>
  );
};

export default MarkWhichQuestionModal;
