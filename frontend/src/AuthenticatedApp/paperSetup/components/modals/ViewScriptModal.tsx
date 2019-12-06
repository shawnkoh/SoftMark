import { Dialog, DialogContent } from "@material-ui/core";
import { ScriptListData } from "backend/src/types/scripts";
import { ScriptDownloadData } from "backend/src/types/view";
import React, { useEffect, useState } from "react";
import api from "../../../../api";
import DialogTitleWithCloseButton from "../../../../components/dialogs/DialogTitleWithCloseButton";
import LoadingSpinner from "../../../../components/LoadingSpinner";

interface Props {
  script: ScriptListData;
  render: any;
}

const ViewScriptModal: React.FC<Props> = props => {
  const { script, render } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);
  const [scriptData, setScriptData] = useState<ScriptDownloadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const downloadScript = async (scriptId: number) => {
    setIsLoading(true);
    api.scripts
      .downloadScript(scriptId)
      .then(resp => {
        setScriptData(resp.data.script);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isOpen && !scriptData) {
      downloadScript(script.id);
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} fullWidth onClose={toggleVisibility}>
        <DialogTitleWithCloseButton
          id="dialog-title-with-close-button"
          onClose={toggleVisibility}
        >
          {`Viewing script ${script.filename}`}
        </DialogTitleWithCloseButton>
        <DialogContent dividers>
          {isLoading && <LoadingSpinner loadingMessage="Loading script..." />}
          {!scriptData && <>This script does not exist</>}
          {scriptData &&
            scriptData.pages.map((page, index) => {
              return <img src={page.imageUrl} />;
            })}
        </DialogContent>
      </Dialog>
      {render(toggleVisibility)}
    </>
  );
};

export default ViewScriptModal;
