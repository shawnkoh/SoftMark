import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@material-ui/core";
import { ScriptMappingData } from "backend/src/types/paperUsers";
import LoadingSpinner from "components/LoadingSpinner";
import usePaper from "contexts/PaperContext";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";
import { DropAreaBase } from "material-ui-file-dropzone";
import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import Papa from "papaparse";

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
    <>
      <DropAreaBase
        accept={".csv"}
        clickable={clickable}
        multiple={false}
        onSelectFiles={files => {
          Object.keys(files).forEach(key => {
            setIsMatchingScriptsAndStudents(true);
            setIsResponseDialogOpen(true);
            const file = files[key];
            Papa.parse(file, {
              complete: results => {
                const scriptMappingData: ScriptMappingData = {
                  rows: results.data
                };
                api.scripts
                  .matchScriptsToStudents(paper.id, scriptMappingData)
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
              }
            });
          });
        }}
      >
        {children}
      </DropAreaBase>
      {responseDialog}
    </>
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
