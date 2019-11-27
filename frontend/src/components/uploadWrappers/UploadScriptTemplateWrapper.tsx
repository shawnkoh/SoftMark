import usePaper from "contexts/PaperContext";
import useScriptTemplate from "contexts/ScriptTemplateContext";
import { DropAreaBase } from "material-ui-file-dropzone";
import React from "react";
import { toast } from "react-toastify";
import api from "../../api";

interface Props {
  clickable?: boolean;
}

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
          toast("Attempting to upload master copy...");
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

export default UploadScriptTemplateWrapper;
