import React from "react";
import api from "../../api";
import { DropAreaBase } from "material-ui-file-dropzone";
import { toast } from "react-toastify";
import usePaper from "contexts/PaperContext";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";

interface Props {
  clickable?: boolean;
}

const UploadNominalRollWrapper: React.FC<Props> = props => {
  const paper = usePaper();
  const { refreshAllStudents } = useScriptsAndStudents();
  const { children, clickable = true } = props;

  return (
    <DropAreaBase
      accept={".csv"}
      clickable={clickable}
      single
      onSelectFiles={files => {
        Object.keys(files).forEach(key => {
          const file = files[key];
          const onSuccess = (name: string) => {
            toast.success(`Account for student ${name} created successfully.`);
          };
          const onFail = (name: string) => {
            toast.error(`Account for student ${name} could not be created.`);
          };
          api.paperUsers.postStudents(
            paper.id,
            file,
            onSuccess,
            onFail,
            refreshAllStudents
          );
        });
      }}
    >
      {children}
    </DropAreaBase>
  );
};

export default UploadNominalRollWrapper;
