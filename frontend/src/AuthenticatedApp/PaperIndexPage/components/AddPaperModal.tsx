import React from "react";
import * as Yup from "yup";
import { PaperPostData } from "backend/src/types/papers";
import { createPaper } from "../../../api/papers";

import { Dialog, DialogContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CustomDialogTitle from "../../../components/dialogs/DialogTitleWithCloseButton";
import SimpleForm, {
  FormMetadataType
} from "../../../components/forms/SimpleForm";

const useStyles = makeStyles(() => ({
  dialogTitle: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingLeft: 30
  }
}));

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
  const classes = useStyles();

  const values: PaperPostData = {
    name: ""
  };

  const formMetadata: FormMetadataType<PaperPostData> = {
    name: { label: "Name", required: true, options: null, xs: 12, sm: 12 }
  };
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required")
  });

  return (
    <Dialog open={visible} onBackdropClick={toggleVisibility} fullWidth>
      <CustomDialogTitle
        id="customized-dialog-title"
        onClose={toggleVisibility}
      >
        Add new paper
      </CustomDialogTitle>
      <DialogContent dividers>
        <SimpleForm
          initialValues={values}
          formMetadata={formMetadata}
          validationSchema={validationSchema}
          onCancel={toggleVisibility}
          onSubmit={(newValues: PaperPostData) =>
            createPaper(newValues).then(resp => {
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
