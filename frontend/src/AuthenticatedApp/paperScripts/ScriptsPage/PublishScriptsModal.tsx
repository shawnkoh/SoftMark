import React, { ReactNode, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../api";
import usePaper from "contexts/PaperContext";
import ConfirmationDialog from "../../../components/dialogs/ConfirmationDialog";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";

interface OwnProps {
  render: (toggleVisibility: () => void) => ReactNode;
}

type Props = OwnProps;

const PublishScriptsModal: React.FC<Props> = props => {
  const paper = usePaper();
  const { refreshScripts } = useScriptsAndStudents();
  const { render } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <ConfirmationDialog
        title={`Publish all unpublished scripts with students`}
        message={`This action is irreversible. Do you still want to publish the scripts?`}
        open={isOpen}
        handleClose={toggleVisibility}
        handleConfirm={() => {
          toggleVisibility();
          toast("Attempting to publish scripts...");
          api.scripts
            .publishScripts(paper.id)
            .then(() => {
              toast.success(`Scripts have been published successfully.`);
            })
            .catch(errors => {
              toast.error(`Scripts could not be published.`);
            })
            .finally(() => refreshScripts());
        }}
      />
      {render(toggleVisibility)}
    </>
  );
};

export default PublishScriptsModal;
