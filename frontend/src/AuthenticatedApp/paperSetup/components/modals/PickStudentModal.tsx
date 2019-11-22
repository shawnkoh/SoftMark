import {
  ScriptListData,
  ScriptPatchData,
  ScriptData
} from "backend/src/types/scripts";
import { PaperUserListData } from "../../../../types/paperUsers";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

import api from "../../../../api";
import usePaper from "contexts/PaperContext";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";

interface Props {
  script: ScriptListData;
  render: any;
  callbackScript: (s: ScriptData) => void;
}

const PickStudentModal: React.FC<Props> = props => {
  const paper = usePaper();
  const {
    unmatchedStudents,
    refreshUnmatchedStudents
  } = useScriptsAndStudents();
  const { render, callbackScript, script } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const [chosenStudent, setChosenStudent] = useState<PaperUserListData | null>(
    script.student
  );

  const [options, setOptions] = useState<Array<PaperUserListData | null>>([]);

  useEffect(() => {
    if (isOpen) {
      const newOptions: Array<PaperUserListData | null> = [
        ...unmatchedStudents
      ];
      if (chosenStudent) {
        newOptions.push(chosenStudent);
      }
      newOptions.push(null);
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
            getOptionLabel={(option: PaperUserListData | null) => {
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
              setChosenStudent(script.student);
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={async () => {
              const scriptPatchData: ScriptPatchData = {
                studentId: chosenStudent ? chosenStudent.id : undefined
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
