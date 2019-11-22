import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import api from "../../api";
import { DropAreaBase } from "material-ui-file-dropzone";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import { toast } from "react-toastify";
import usePaper from "contexts/PaperContext";

interface OwnProps {
  setScriptTemplate: React.Dispatch<ScriptTemplateData>;
  clickable?: boolean;
}

type Props = RouteComponentProps & OwnProps;

const UploadScriptTemplateWrapper: React.FC<Props> = props => {
  const paper = usePaper();
  const { children, clickable = true, setScriptTemplate } = props;

  return (
    <DropAreaBase
      accept={".pdf"}
      clickable={clickable}
      single
      onSelectFiles={files => {
        Object.keys(files).forEach(key => {
          const onSuccess = () => {
            toast.success(`Script template has been uploaded successfully.`);
          };
          const onFail = () => {
            toast.error(`Script template has failed to be uploaded.`);
          };
          api.scriptTemplates.postScriptTemplate(
            paper.id,
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
