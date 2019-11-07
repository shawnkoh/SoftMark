import React, { useState, useEffect, Dispatch } from "react";
import * as Yup from "yup";
import api from "../../../../api";
import { PaperUserListData } from "../../../../types/paperUsers";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip
} from "@material-ui/core";
import Edit from "@material-ui/icons/Edit";
import SimpleForm, {
  FormMetadataType
} from "../../../../components/forms/SimpleForm";
import { UserPatchData } from "backend/src/types/users";
import { PaperUserPostData, PaperUserRole } from "../../../../types/paperUsers";
import ThemedButton from "../../../../components/buttons/ThemedButton";
import { toast } from "react-toastify";

interface OwnProps {
  paperId: number;
  refreshStudents: () => void;
}

type Props = OwnProps;

const AddStudentModal: React.FC<Props> = props => {
  const { refreshStudents, paperId } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const values: PaperUserPostData = {
    name: "",
    email: "",
    matriculationNumber: "",
    role: PaperUserRole.Student
  };

  const formMetadata: FormMetadataType<any> = {
    matriculationNumber: {
      label: "Matric no.",
      required: true,
      options: null,
      xs: 12,
      sm: 12
    },
    name: { label: "Name", required: true, options: null, xs: 12, sm: 12 },
    email: { label: "Email", required: true, options: null, xs: 12, sm: 12 }
  };
  const validationSchema = Yup.object({
    matriculationNumber: Yup.string().required(
      "Matriculation number is required"
    ),
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required")
  });

  return (
    <>
      <Dialog open={isOpen} fullWidth onBackdropClick={toggleVisibility}>
        <DialogTitle>Student data</DialogTitle>
        <DialogContent>
          <SimpleForm
            initialValues={values}
            formMetadata={formMetadata}
            validationSchema={validationSchema}
            includeReset={true}
            onCancel={toggleVisibility}
            onSubmit={(newValues: any) =>
              api.paperUsers
                .createPaperUser(paperId, newValues)
                .then(resp => {
                  refreshStudents();
                  return false;
                })
                .catch(() => {
                  toast.error(
                    `Account for student ${newValues.name} could not be created.`
                  );
                  return false;
                })
                .finally(toggleVisibility)
            }
          />
        </DialogContent>
      </Dialog>
      <ThemedButton label="Add" filled onClick={toggleVisibility} />
    </>
  );
};

export default AddStudentModal;
