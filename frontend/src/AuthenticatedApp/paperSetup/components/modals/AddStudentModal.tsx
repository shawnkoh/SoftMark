import { Dialog, DialogContent } from "@material-ui/core";
import React, { ReactNode, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import api from "../../../../api";
import CustomDialogTitle from "../../../../components/dialogs/DialogTitleWithCloseButton";
import SimpleForm, {
  FormMetadataType
} from "../../../../components/forms/SimpleForm";
import { PaperUserPostData, PaperUserRole } from "../../../../types/paperUsers";

interface OwnProps {
  paperId: number;
  refreshStudents: () => void;
  render: (toggleVisibility: () => void) => ReactNode;
}

type Props = OwnProps;

const AddStudentModal: React.FC<Props> = props => {
  const { paperId, refreshStudents, render } = props;
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
      <Dialog open={isOpen} fullWidth onClose={toggleVisibility}>
        <CustomDialogTitle id="add-student-modal" onClose={toggleVisibility}>
          Add new student
        </CustomDialogTitle>
        <DialogContent dividers>
          <SimpleForm
            initialValues={values}
            formMetadata={formMetadata}
            validationSchema={validationSchema}
            includeReset={false}
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
      {render(toggleVisibility)}
    </>
  );
};

export default AddStudentModal;
