import React from "react";
import api from "../../api";
import { DropAreaBase } from "material-ui-file-dropzone";
import { PaperData } from "backend/src/types/papers";
import useSnackbar from "../../components/snackbar/useSnackbar";

interface Props {
  paperId: number;
  clickable?: boolean;
  refreshStudents?: () => void;
  refreshScripts?: () => void;
}

const UploadNominalRollWrapper: React.FC<Props> = props => {
  const snackbar = useSnackbar();
  const {
    paperId,
    children,
    clickable = true,
    refreshStudents,
    refreshScripts
  } = props;

  return (
    <DropAreaBase
      accept={".csv"}
      clickable={clickable}
      single
      onSelectFiles={files => {
        Object.keys(files).forEach(key => {
          const file = files[key];
          const onSuccessfulResponse = () => {
            if (refreshStudents) {
              refreshStudents();
            }
            if (refreshScripts) {
              refreshScripts();
            }
            snackbar.showMessage(
              `Nominal roll list has been uploaded successfully.`,
              "Close"
            );
          };
          // TODO: api to create paperUsers here
          api.paperUsers.postStudents(paperId, file, onSuccessfulResponse);
        });
      }}
    >
      {children}
    </DropAreaBase>
  );
};

export default UploadNominalRollWrapper;
