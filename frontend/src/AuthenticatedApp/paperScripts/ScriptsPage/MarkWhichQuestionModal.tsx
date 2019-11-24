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
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api";
import usePaper from "../../../contexts/PaperContext";
import CustomDialogTitle from "../../../components/dialogs/DialogTitleWithCloseButton";

interface Props {
  baseUrl: string;
  render: any;
}

const MarkWhichQuestionModal: React.FC<Props> = props => {
  const { baseUrl, render } = props;
  const paper = usePaper();
  const { id: paperId } = paper;

  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const [questionTemplates, setQuestionTemplates] = useState<
    { id: number; name: string }[]
  >([]);

  const mapQuestionTemplateIds = async (questionTemplateIds: number[]) => {
    return Promise.all(
      questionTemplateIds.map(async questionTemplateId => {
        const response = await api.questionTemplates.getQuestionTemplate(
          questionTemplateId
        );
        const questionTemplate = response.data.questionTemplate;
        return { id: questionTemplateId, name: questionTemplate.name };
      })
    );
  };

  const getQuestionTemplates = async () => {
    const allocationsResponse = await api.allocations.getSelfAllocations(
      paperId
    );
    const allocations = allocationsResponse.data;
    const questionTemplateIds = allocations.map(
      allocation => allocation.questionTemplateId
    );
    const questionTemplates = await mapQuestionTemplateIds(questionTemplateIds);
    setQuestionTemplates(questionTemplates);
  };

  useEffect(() => {
    getQuestionTemplates();
  }, []);

  return (
    <>
      <Dialog open={isOpen} onClose={toggleVisibility}>
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
              <ListItemText primary={questionTemplate.name} />
            </ListItem>
          ))}
        </List>
      </Dialog>
      {render(toggleVisibility)}
    </>
  );
};

export default MarkWhichQuestionModal;
