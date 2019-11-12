import React, { useState } from "react";
import * as Yup from "yup";
import { PaperPostData, PaperData } from "backend/src/types/papers";
import { editPaper } from "../../../api/papers";

import { Dialog, DialogContent } from "@material-ui/core";
import CustomDialogTitle from "../../../components/dialogs/DialogTitleWithCloseButton";
import SimpleForm, {
  FormMetadataType
} from "../../../components/forms/SimpleForm";

interface OwnProps {
  paper: PaperData;
  render: any;
  refreshPaper: () => void;
}

type Props = OwnProps;

const EditPaperModal: React.FC<Props> = ({ paper, refreshPaper, render }) => {
  const values: PaperPostData = {
    name: paper.name
  };

  const formMetadata: FormMetadataType<PaperPostData> = {
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
            onSubmit={(newValues: PaperPostData) =>
              editPaper(paper.id, newValues).then(resp => {
                refreshPaper();
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
