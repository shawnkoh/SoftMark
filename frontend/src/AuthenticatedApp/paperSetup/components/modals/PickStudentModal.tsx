import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { ScriptListData, ScriptPatchData } from "backend/src/types/scripts";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../../api";
import { StudentListData } from "../../../../types/paperUsers";

interface Props {
  script: ScriptListData;
  render: any;
  callbackScript: (s: ScriptListData) => void;
}

interface StudentOption {
  studentId: number;
  matriculationNumber: string | null;
  studentEmail: string;
}

const PickStudentModal: React.FC<Props> = props => {
  const {
    unmatchedStudents,
    refreshUnmatchedStudents
  } = useScriptsAndStudents();
  const { render, callbackScript, script } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const currentStudent: StudentOption | null =
    script.studentId && script.studentEmail
      ? {
          studentId: script.studentId,
          matriculationNumber: script.matriculationNumber,
          studentEmail: script.studentEmail
        }
      : null;

  const [chosenStudent, setChosenStudent] = useState<StudentOption | null>(
    currentStudent
  );

  const [options, setOptions] = useState<StudentOption[]>([]);

  useEffect(() => {
    if (isOpen) {
      const newOptions: StudentOption[] = unmatchedStudents.map(student => ({
        studentId: student.id,
        matriculationNumber: student.matriculationNumber,
        studentEmail: student.user.email
      }));
      if (chosenStudent) {
        newOptions.push(chosenStudent);
      }
      setOptions(newOptions);
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onClose={toggleVisibility}>
        <DialogTitle>{`Select student for script "${script.filename}"`}</DialogTitle>
        <DialogContent>
          <Autocomplete
            clearOnEscape
            defaultValue={chosenStudent}
            options={options}
            getOptionLabel={(option: StudentListData | null) => {
              if (!option) {
                return "No match";
              }

              return option.matriculationNumber
                ? option.matriculationNumber
                : option.user.email;
            }}
            onChange={(event: object, value: any) => setChosenStudent(value)}
            renderInput={params => (
              <TextField {...params} variant="outlined" fullWidth />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              toggleVisibility();
              setChosenStudent(currentStudent);
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={async () => {
              const scriptPatchData: ScriptPatchData = {
                studentId: chosenStudent ? chosenStudent.studentId : null
              };
              api.scripts
                .patchScript(script.id, scriptPatchData)
                .then(resp => {
                  callbackScript(resp.data.script);
                  toggleVisibility();
                  toast(
                    `Script ${script.filename} has been updated successfully.`
                  );
                  refreshUnmatchedStudents();
                })
                .catch(errors => {
                  toast.error(
                    `Script ${script.filename} could not be updated.`
                  );
                });
            }}
          >
            Select
          </Button>
        </DialogActions>
      </Dialog>
      {render(toggleVisibility)}
    </>
  );
};

export default PickStudentModal;
