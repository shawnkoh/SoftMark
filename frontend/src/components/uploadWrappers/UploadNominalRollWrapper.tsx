import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import api from "../../api";
import { DropAreaBase } from "material-ui-file-dropzone";
import { PaperData } from "backend/src/types/papers";
import useSnackbar from "../../components/snackbar/useSnackbar";

interface OwnProps {
  paperId: number;
  clickable?: boolean;
  refreshStudentList?: () => void;
  refreshScriptList?: () => void;
}

type Props = RouteComponentProps & OwnProps;

const UploadNominalRollWrapper: React.FC<Props> = props => {
  const snackbar = useSnackbar();
  const {
    paperId,
    children,
    clickable = true,
    refreshStudentList,
    refreshScriptList
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
            if (refreshStudentList) {
              refreshStudentList();
            }
            if (refreshScriptList) {
              refreshScriptList();
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

export default withRouter(UploadNominalRollWrapper);
