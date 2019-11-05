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
  const {
    children,
    paperId,
    refreshScripts
  } = props;

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
              const onSuccessfulResponse = () => {
                refreshScripts();
                scriptUploadCount++;
                snackbar.showMessage(
                  `Script ${fileName} has been uploaded successfully.\n` +
                    scriptUploadCount +
                    ` scripts uploaded successfully.`
                );
              };
              api.scripts.postScript(
                paperId,
                fileName,
                file,
                onSuccessfulResponse
              );
            });
          }}
>
      {children}
    </DropAreaBase>
  );
};

export default withRouter(UploadScriptsWrapper);
