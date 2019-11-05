import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import api from "../../api";
import { DropAreaBase } from "material-ui-file-dropzone";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import useSnackbar from "../../components/snackbar/useSnackbar";

interface OwnProps {
  paperId: number;
  setScriptTemplate: React.Dispatch<ScriptTemplateData>;
  clickable?: boolean;
}

type Props = RouteComponentProps & OwnProps;

const UploadScriptTemplateWrapper: React.FC<Props> = props => {
  const snackbar = useSnackbar();
  const { children, clickable = true, paperId, setScriptTemplate } = props;

  return (
    <DropAreaBase
      accept={".pdf"}
      clickable={clickable}
      single
      onSelectFiles={files => {
        Object.keys(files).forEach(key => {
          const onSuccess = () => {
            snackbar.showMessage(
              `Script template has been uploaded successfully.`,
              "Close"
            );
          };
          const onFail = () => {
            snackbar.showMessage(
              `Script template has failed to be uploaded.`,
              "Close"
            );
          };
          api.scriptTemplates.postScriptTemplate(
            paperId,
            files[key],
            onSuccess,
            onFail,
            setScriptTemplate
          );
        });
      }}
    >
      {children}
    </DropAreaBase>
  );
};

export default withRouter(UploadScriptTemplateWrapper);
