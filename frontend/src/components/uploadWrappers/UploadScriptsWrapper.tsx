import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import api from "../../api";
import { DropAreaBase } from "material-ui-file-dropzone";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import { toast } from "react-toastify";

interface OwnProps {
  paperId: number;
  refreshScripts: () => void;
}

type Props = RouteComponentProps & OwnProps;

const UploadScriptsWrapper: React.FC<Props> = props => {
  const { children, paperId, refreshScripts } = props;

  return (
    <DropAreaBase
      accept={".pdf"}
      clickable
      multiple
      onSelectFiles={async files => {
        const keys = Object.keys(files);
        let scriptUploaded = 0;
        let scriptsLeft = keys.length;
        const asynchronousPostScript = async (index: number, limit: number) => {
          scriptsLeft--;
          if (index < limit) {
            const key = keys[index];
            const file = files[key];
            const fileName = file.name.split(".")[0].toUpperCase();
            const onSuccess = () => {
              scriptUploaded++;
              if (scriptsLeft === 0 || scriptUploaded % 30 === 0) {
                setTimeout(refreshScripts, 3000);
              }
              toast.success(
                `Script ${fileName} has been uploaded successfully.\n` +
                  scriptUploaded +
                  ` script(s) uploaded successfully.`
              );
            };
            const onFail = () => {
              toast.error(`Script ${fileName} could not be uploaded.\n`);
            };
            const atLoadEnd = () => asynchronousPostScript(index + 1, limit);
            await api.scripts.postScript(
              paperId,
              fileName,
              file,
              onSuccess,
              onFail,
              atLoadEnd
            );
          }
          if (scriptsLeft <= 2) {
            setTimeout(refreshScripts, 3000);
          }
        };
        const threads = 8;
        let prevUpperLimitForIndex = 0;
        let upperLimitForIndex = 0;
        for (let i = 1; i <= threads; i++) {
          upperLimitForIndex = Math.floor((i / threads) * keys.length);
          if (prevUpperLimitForIndex !== upperLimitForIndex) {
            asynchronousPostScript(prevUpperLimitForIndex, upperLimitForIndex);
            prevUpperLimitForIndex = upperLimitForIndex;
          }
        }
      }}
    >
      {children}
    </DropAreaBase>
  );
};

export default withRouter(UploadScriptsWrapper);
