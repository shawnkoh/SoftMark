import React from "react";
import api from "../../api";
import { DropAreaBase } from "material-ui-file-dropzone";
import { PaperData } from "backend/src/types/papers";
import { toast } from "react-toastify";

interface Props {
  paperId: number;
  clickable?: boolean;
  refreshScripts?: () => void;
  refreshStudents?: () => void;
}

const UploadNominalRollWrapper: React.FC<Props> = props => {
  const {
    paperId,
    children,
    clickable = true,
    refreshScripts,
    refreshStudents
  } = props;

  return (
    <DropAreaBase
      accept={".csv"}
      clickable={clickable}
      single
      onSelectFiles={files => {
        Object.keys(files).forEach(key => {
          const file = files[key];
          const refresh = () => {
            if (refreshStudents) {
              refreshStudents();
            }
            if (refreshScripts) {
              refreshScripts();
            }
          };
          const onSuccess = (name: string) => {
            toast.success(`Account for student ${name} created successfully.`);
          };
          const onFail = (name: string) => {
            toast.error(`Account for student ${name} could not be created.`);
          };
          api.paperUsers.postStudents(
            paperId,
            file,
            onSuccess,
            onFail,
            refresh
          );
        });
      }}
    >
      {children}
    </DropAreaBase>
  );
};

export default UploadNominalRollWrapper;
