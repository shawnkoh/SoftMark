import usePaper from "contexts/PaperContext";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";
import React, { ReactNode, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../api";
import ConfirmationDialog from "../../../components/dialogs/ConfirmationDialog";

interface Props {
  render: (toggleVisibility: () => void) => ReactNode;
}

const PublishScriptsModal: React.FC<Props> = props => {
  const { render } = props;
  const paper = usePaper();
  const { scripts, refreshScripts } = useScriptsAndStudents();
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const publishCount = scripts.reduce((count, script) => {
    if (!script.publishedDate && script.studentId) {
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

  return (
    <>
      <ConfirmationDialog
        title={`Publish Scripts`}
        message={`Are you sure you want to publish scripts to ${publishCount} students? There are ${unmatchedCount} unmatched scripts. <b>Only matched scripts will be published.</b> This action cannot be undone.`}
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
      />
      {render(toggleVisibility)}
    </>
  );
};

export default PublishScriptsModal;
