import React from "react";
import * as Yup from "yup";
import api from "../../../../api";
import { Dialog, DialogTitle, DialogContent } from "@material-ui/core";
import SimpleForm, { FormMetadataType } from "../forms/SimpleForm";
import { PAPER_USER_ROLE_OPTIONS } from "../../../../utils/options";
import { PaperUserRole, PaperUserPostData } from "backend/src/types/paperUsers";

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
      <DialogTitle>Add new paper</DialogTitle>
      <DialogContent>
        <SimpleForm
          initialValues={values}
          formMetadata={formMetadata}
          validationSchema={validationSchema}
          onCancel={toggleVisibility}
          onSubmit={(newValues: PaperUserPostData) =>
            api.papers.createPaperUser(paperId, newValues).then(resp => {
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

export default AddMarkerModal;
