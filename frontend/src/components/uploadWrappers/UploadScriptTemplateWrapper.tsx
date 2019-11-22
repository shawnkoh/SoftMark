import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import api from "../../api";
import { DropAreaBase } from "material-ui-file-dropzone";
import { toast } from "react-toastify";
import usePaper from "contexts/PaperContext";
import useScriptTemplate from "contexts/ScriptTemplateContext";

interface OwnProps {
  clickable?: boolean;
}

type Props = RouteComponentProps & OwnProps;

const UploadScriptTemplateWrapper: React.FC<Props> = props => {
  const paper = usePaper();
  const { refreshScriptTemplate } = useScriptTemplate();
  const { children, clickable = true } = props;

  return (
    <DropAreaBase
      accept={".pdf"}
      clickable={clickable}
      multiple={false}
      onSelectFiles={files => {
        Object.keys(files).forEach(key => {
          const onSuccess = () => {
            refreshScriptTemplate();
            toast.success(`Script template has been uploaded successfully.`);
          };
          const onFail = () => {
            toast.error(`Script template has failed to be uploaded.`);
          };
          api.scriptTemplates.postScriptTemplate(
            paper.id,
            files[key],
            onSuccess,
            onFail
          );
        });
      }}
    >
      {children}
    </DropAreaBase>
  );
};

export default withRouter(UploadScriptTemplateWrapper);
