import React, { useState } from "react";
import api from "../../api";
import { DropAreaBase } from "material-ui-file-dropzone";
import { Dialog, DialogContent, DialogContentText } from "@material-ui/core";
import { ScriptStudentMappingPatchData } from "backend/src/types/paperUsers";
import { toast } from "react-toastify";
import usePaper from "contexts/PaperContext";
import { DialogTitle } from "@material-ui/core";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";
import LoadingSpinner from "components/LoadingSpinner";

const NONE = "None";

interface Props {
  clickable?: boolean;
}

const UploadScriptStudentMappingWrapper: React.FC<Props> = props => {
  const paper = usePaper();
  const {
    refreshAllStudents,
    refreshUnmatchedStudents,
    refreshScripts
  } = useScriptsAndStudents();
  const { children, clickable = true } = props;

  const [
    isMatchingScriptsAndStudents,
    setIsMatchingScriptsAndStudents
  ] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [studentMatched, setStudentsMatched] = useState(NONE);
  const [studentsFailedToBeMatched, setStudentsFailedToBeMatched] = useState(
    NONE
  );

  const responseDialog = (
    <Dialog
      fullWidth
      open={isResponseDialogOpen}
      onClose={() => {
        setIsResponseDialogOpen(false);
        setStudentsMatched(NONE);
        setStudentsFailedToBeMatched(NONE);
      }}
    >
      {isMatchingScriptsAndStudents && (
        <LoadingSpinner loadingMessage="Matching students to scripts..." />
      )}
      {!isMatchingScriptsAndStudents && (
        <>
          <DialogTitle>Result of upload</DialogTitle>
          <DialogContent dividers>
            <DialogContentText>Successfully matched students</DialogContentText>
            {splitStringIntoLines(studentMatched)}
            <br />
            <br />
            <br />
            <DialogContentText>
              Students that were not successfully matched
            </DialogContentText>
            {splitStringIntoLines(studentsFailedToBeMatched)}
          </DialogContent>
        </>
      )}
    </Dialog>
  );

  return (
    <DropAreaBase
      accept={".csv"}
      clickable={clickable}
      multiple={false}
      onSelectFiles={files => {
        Object.keys(files).forEach(key => {
          setIsMatchingScriptsAndStudents(true);
          setIsResponseDialogOpen(true);
          const file = files[key];
          const reader = new FileReader();
          reader.onloadend = async (e: any) => {
            const scriptStudentMappingPatchData: ScriptStudentMappingPatchData = {
              csvFile: e.target.result
            };
            api.scripts
              .matchScriptsToStudents(paper.id, scriptStudentMappingPatchData)
              .then(resp => {
                setStudentsFailedToBeMatched(resp.data.failedToBeMatched);
                setStudentsMatched(resp.data.successfullyMatched);
                setIsMatchingScriptsAndStudents(false);
                setIsResponseDialogOpen(true);
                refreshScripts();
                toast.success(`Account for students created successfully.`);
              })
              .catch(() => {
                setIsMatchingScriptsAndStudents(false);
                setIsResponseDialogOpen(false);
                toast.error(`Accounts for students could not be created.`);
              })
              .finally(() => {
                refreshUnmatchedStudents();
                refreshAllStudents();
              });
          };
          reader.readAsText(file);
        });
      }}
    >
      {children}
      {responseDialog}
    </DropAreaBase>
  );
};

export default UploadScriptStudentMappingWrapper;

const splitStringIntoLines = (str: string) => {
  if (str.toLocaleLowerCase() === "none") {
    return str;
  }
  const lines = str.split("\n");
  return lines.map((line, index) =>
    line !== "" ? (
      <>
        {`${index + 1}. ${line}`}
        <br />
      </>
    ) : (
      line
    )
  );
};
