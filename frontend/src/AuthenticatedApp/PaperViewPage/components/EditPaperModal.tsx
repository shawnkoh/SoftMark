import { Dialog, DialogContent } from "@material-ui/core";
import { PaperPostData } from "backend/src/types/papers";
import React, { useState } from "react";
import * as Yup from "yup";
import { PaperPatchData, PaperData } from "backend/src/types/papers";
import { editPaper } from "../../../api/papers";
import CustomDialogTitle from "../../../components/dialogs/DialogTitleWithCloseButton";
import SimpleForm, {
  FormMetadataType
} from "../../../components/forms/SimpleForm";
import usePaper from "../../../contexts/PaperContext";

interface OwnProps {
  render: any;
}

type Props = OwnProps;

const EditPaperModal: React.FC<Props> = ({ render }) => {
  const paper = usePaper();
  const values: PaperPatchData = {
    name: paper.name
  };

  const formMetadata: FormMetadataType<PaperPatchData> = {
    name: { label: "Name", required: true, options: null, xs: 12, sm: 12 }
  };
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required")
  });

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <>
      <Dialog open={isVisible} onBackdropClick={toggleVisibility} fullWidth>
        <CustomDialogTitle
          id="customized-dialog-title"
          onClose={toggleVisibility}
        >
          Edit paper
        </CustomDialogTitle>
        <DialogContent dividers>
          <SimpleForm
            initialValues={values}
            formMetadata={formMetadata}
            validationSchema={validationSchema}
            onCancel={toggleVisibility}
            onSubmit={(newValues: PaperPatchData) =>
              editPaper(paper.id, newValues).then(resp => {
                paper.refreshPaper();
                toggleVisibility();
                return false;
              })
            }
          />
        </DialogContent>
      </Dialog>
      {render(toggleVisibility)}
    </>
  );
};

export default EditPaperModal;
