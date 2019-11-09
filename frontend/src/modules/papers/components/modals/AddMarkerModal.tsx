import React from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { PAPER_USER_ROLE_OPTIONS } from "../../../../utils/options";
import { PaperUserRole, PaperUserPostData } from "../../../../types/paperUsers";
import api from "../../../../api";

import { Dialog, DialogContent } from "@material-ui/core";
import SimpleForm, { FormMetadataType } from "components/forms/SimpleForm";
import CustomDialogTitle from "../../../../components/dialogs/DialogTitleWithCloseButton";

interface OwnProps {
  paperId: number;
  visible: boolean;
  toggleVisibility: () => void;
  toggleRefresh: () => void;
}

type Props = OwnProps;

const AddMarkerModal: React.FC<Props> = ({
  visible,
  toggleVisibility,
  toggleRefresh,
  paperId
}) => {
  const values: PaperUserPostData = {
    email: "",
    role: PaperUserRole.Marker
  };

  const formMetadata: FormMetadataType<PaperUserPostData> = {
    email: { label: "Email", required: true, options: null, xs: 10, sm: 10 },
    role: {
      label: "Role",
      required: true,
      options: PAPER_USER_ROLE_OPTIONS,
      xs: 12,
      sm: 6
    }
  };
  const validationSchema = Yup.object({
    role: Yup.string().required("Role is required"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required")
  });

  return (
    <Dialog open={visible} onBackdropClick={toggleVisibility} fullWidth>
      <CustomDialogTitle
        id="customized-dialog-title"
        onClose={toggleVisibility}
      >
        Add new marker
      </CustomDialogTitle>
      <DialogContent>
        <SimpleForm
          initialValues={values}
          formMetadata={formMetadata}
          validationSchema={validationSchema}
          onCancel={toggleVisibility}
          onSubmit={(newValues: PaperUserPostData) =>
            api.papers
              .createPaperUser(paperId, newValues)
              .then(resp => {
                toggleRefresh();
                toggleVisibility();
                return false;
              })
              .catch(() => {
                toast.error(`Marker could not be created.`);
                return false;
              })
          }
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddMarkerModal;
