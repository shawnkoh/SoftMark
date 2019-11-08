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
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import matchSorter from "match-sorter";

import api from "../../../../api";

interface Props {
  script: ScriptListData;
  render: any;
  callbackScript: (s: ScriptData) => void;
}

const PickStudentModal: React.FC<Props> = props => {
  const { render, callbackScript, script } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const [chosenStudent, setChosenStudent] = useState<PaperUserListData | null>(
    script.student
  );

  const [unmatchedStudents, setUnmatchedStudents] = useState<
    Array<PaperUserListData | null>
  >([]);

  useEffect(() => {
    api.paperUsers.getUnmatchedStudents(script.paperId).then(resp => {
      const options: Array<PaperUserListData | null> = resp.data.paperUsers;
      if (chosenStudent) {
        options.push(chosenStudent);
      }
      options.push(null);
      setUnmatchedStudents(options);
    });
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} fullWidth onBackdropClick={toggleVisibility}>
        <DialogTitle>{`Pick student for script "${script.filename}".`}</DialogTitle>
        <DialogContent>
          <Typography>Matched student:</Typography>
          <Autocomplete
            clearOnEscape
            defaultValue={chosenStudent}
            options={unmatchedStudents}
            getOptionLabel={(option: PaperUserListData | null) => {
              if (!option) {
                return "No match";
              }

              return option.matriculationNumber
                ? option.matriculationNumber
                : option.user.email;
            }}
            onChange={(event: object, value: any) => setChosenStudent(value)}
            style={{ width: 300 }}
            renderInput={params => (
              <TextField {...params} margin="normal" fullWidth />
            )}
          />
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
                  toast(
                    `Script ${script.filename} has been updated successfully.`
                  );
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
        </DialogContent>
      </Dialog>
      {render(toggleVisibility)}
    </>
  );
};

export default PickStudentModal;
