import { Dialog, DialogContent } from "@material-ui/core";
import React, { Dispatch, ReactNode, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import api from "../../../../api";
import CustomDialogTitle from "../../../../components/dialogs/DialogTitleWithCloseButton";
import SimpleForm, {
  FormMetadataType
} from "../../../../components/forms/SimpleForm";
import { StudentListData } from "../../../../types/paperUsers";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";

interface OwnProps {
  student: StudentListData;
  callbackStudentData: Dispatch<any>;
  render: (toggleVisibility: () => void) => ReactNode;
}

type Props = OwnProps;

const EditStudentModal: React.FC<Props> = props => {
  const { matchScriptsToStudents } = useScriptsAndStudents();
  const { student, callbackStudentData, render } = props;
  const { matriculationNumber, user, scriptFilename } = student;
  const { name, email } = user;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const values = {
    name,
    email,
    matriculationNumber,
    scriptFilename
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
    email: { label: "Email", required: true, options: null, xs: 12, sm: 12 },
    scriptFilename: {
      label: "Script filename",
      required: true,
      options: null,
      xs: 12,
      sm: 12
    }
  };
  const validationSchema = Yup.object({
    matriculationNumber: Yup.string().required(
      "Matriculation number is required"
    ),
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    scriptFilename: Yup.string().required("Name is required")
  });

  return (
    <>
      <Dialog open={isOpen} fullWidth onClose={toggleVisibility}>
        <CustomDialogTitle id="edit-student-modal" onClose={toggleVisibility}>
          Edit student
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
                .patchStudent(student.id, newValues)
                .then(resp => {
                  matchScriptsToStudents();
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
