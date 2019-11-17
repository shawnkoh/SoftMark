import { Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import React, { Dispatch, useState, ReactNode } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import api from "../../../../api";
import SimpleForm, {
  FormMetadataType
} from "../../../../components/forms/SimpleForm";
import { PaperUserListData } from "../../../../types/paperUsers";

interface OwnProps {
  student: PaperUserListData;
  callbackStudentData: Dispatch<any>;
  render: (toggleVisibility: () => void) => ReactNode;
}

type Props = OwnProps;

const EditStudentModal: React.FC<Props> = props => {
  const { student, callbackStudentData, render } = props;
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
      label: "Matriculation number",
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
      <Dialog open={isOpen} fullWidth onClose={toggleVisibility}>
        <DialogTitle>Edit student</DialogTitle>
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
                  toast.error("Student could not be updated.");
                  return false;
                })
                .finally(toggleVisibility)
            }
          />
        </DialogContent>
      </Dialog>
      {render(toggleVisibility)}
    </>
  );
};

export default EditStudentModal;
