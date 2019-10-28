import React from "react";
import * as Yup from "yup";
import api from "../../../../api";
import { Dialog, DialogTitle, DialogContent } from "@material-ui/core";
import { PaperPostData } from "backend/src/types/papers";
import SimpleForm, {
  FormMetadataType
} from "../../../../components/forms/SimpleForm";

interface OwnProps {
  visible: boolean;
  toggleVisibility: () => void;
  toggleRefresh: () => void;
}

type Props = OwnProps;

const AddPaperModal: React.FC<Props> = ({
  visible,
  toggleVisibility,
  toggleRefresh
}) => {
  const values: PaperPostData = {
    name: ""
  };

  const formMetadata: FormMetadataType<PaperPostData> = {
    name: { label: "Name", required: true, options: null, xs: 10, sm: 10 }
  };
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required")
  });

  return (
    <Dialog open={visible} onBackdropClick={toggleVisibility} fullWidth>
      <DialogTitle>Add new paper</DialogTitle>
      <DialogContent>
        <SimpleForm
          initialValues={values}
          formMetadata={formMetadata}
          validationSchema={validationSchema}
          onCancel={toggleVisibility}
          onSubmit={(newValues: PaperPostData) =>
            api.papers.createPaper(newValues).then(resp => {
              toggleRefresh();
              toggleVisibility();
              return false;
            })
          }
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddPaperModal;
