import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import api from "../../api";
import { DropAreaBase } from "material-ui-file-dropzone";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import useSnackbar from "../../components/snackbar/useSnackbar";

interface OwnProps {
  paperId: number;
  refreshScripts: () => void;
}

type Props = RouteComponentProps & OwnProps;

const UploadScriptsWrapper: React.FC<Props> = props => {
  const snackbar = useSnackbar();
  const { children, paperId, refreshScripts } = props;

  return (
    <DropAreaBase
      accept={".pdf"}
      clickable
      multiple
      onSelectFiles={files => {
        let scriptUploadCount = 0;
        Object.keys(files).forEach(key => {
          const file = files[key];
          const fileName = file.name.split(".")[0].toUpperCase();
          const onSuccess = () => {
            refreshScripts();
            scriptUploadCount++;
            snackbar.showMessage(
              `Script ${fileName} has been uploaded successfully.\n` +
                scriptUploadCount +
                ` script(s) uploaded successfully.`
            );
          };
          const onFail = () => {
            snackbar.showMessage(
              `Script ${fileName} could not be uploaded.\n`,
              "Close"
            );
          };
          api.scripts.postScript(paperId, fileName, file, onSuccess, onFail);
        });
      }}
    >
      {children}
    </DropAreaBase>
  );
};

export default withRouter(UploadScriptsWrapper);
