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
import { PaperUserPatchData } from "backend/src/types/paperUsers";
import {toast} from "react-toastify";

interface OwnProps {
  student: PaperUserListData;
  callbackStudentData: Dispatch<any>;
}

type Props = OwnProps;

const EditStudentModal: React.FC<Props> = props => {
  const { student, children, callbackStudentData } = props;
  const { matriculationNumber, user } = student;
  const { name, email } = user;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const values = {
    name,
    email,
    matriculationNumber
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
                .patchStudent(student.id, newValues)
                .then(resp => {
                  callbackStudentData(resp.data.paperUser);
                  return false;
                })
                .catch(() => {
                  toast.error(
                    "Student could not be updated."
                  );
                  return false;
                })
                .finally(toggleVisibility)
            }
          />
        </DialogContent>
      </Dialog>
      <Tooltip title={"Edit student"}>
        <IconButton onClick={toggleVisibility}>
          <Edit />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default EditStudentModal;
