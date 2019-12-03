import { DialogContentText } from "@material-ui/core";
import { ScriptListData } from "backend/src/types/scripts";
import usePaper from "contexts/PaperContext";
import React, { ReactNode, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../api";
import ConfirmationDialog from "../../../components/dialogs/ConfirmationDialog";
import useScriptsAndStudents from "../../../contexts/ScriptsAndStudentsContext";

interface Props {
  scripts: ScriptListData[];
  render: (toggleVisibility: () => void) => ReactNode;
}

const PublishScriptsModal: React.FC<Props> = props => {
  const { scripts, render } = props;
  const paper = usePaper();
  const { refreshScripts } = useScriptsAndStudents();
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const publishCount = scripts.reduce((count, script) => {
    if (!script.publishedDate && script.studentId && script.completedMarking) {
      return count + 1;
    }
    return count;
  }, 0);

  const unmatchedCount = scripts.reduce((count, script) => {
    if (!script.publishedDate && !script.studentId) {
      return count + 1;
    }
    return count;
  }, 0);

  const unmarkedCount = scripts.reduce((count, script) => {
    if (!script.publishedDate && !script.completedMarking) {
      return count + 1;
    }
    return count;
  }, 0);

  return (
    <>
      <ConfirmationDialog
        title={`Publish Scripts`}
        open={isOpen}
        handleClose={toggleVisibility}
        handleConfirm={() => {
          toggleVisibility();
          api.papers
            .publish(paper.id)
            .then(() => {
              toast.success(`Scripts have been published successfully.`);
            })
            .catch(errors => {
              toast.error(
                `An unexpected error occured while publishing the scripts. Try refreshing the page.`
              );
            })
            .finally(() => refreshScripts());
        }}
      >
        <DialogContentText>
          Are you sure you want to publish {paper.name}?
        </DialogContentText>
        <DialogContentText>
          <b>Only matched and marked scripts will be published.</b>
        </DialogContentText>
        <DialogContentText>
          Of {scripts.length} scripts, {publishCount} are ready to be published.
          There are {unmatchedCount} unmatched and {unmarkedCount} unmarked
          scripts.
        </DialogContentText>
        <DialogContentText>
          If you publish this paper, the unpublished scripts will automatically
          be published when they have been matched and marked.
          <br />
          This action cannot be undone.
        </DialogContentText>
      </ConfirmationDialog>
      {render(toggleVisibility)}
    </>
  );
};

export default PublishScriptsModal;
