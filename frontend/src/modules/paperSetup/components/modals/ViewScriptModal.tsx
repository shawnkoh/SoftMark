import React, { useState, useEffect } from "react";

import api from "../../../../api";
import TogglePageComponent from "../../../../components/misc/TogglePageComponent";
import Canvas from "../../../scripts/components/Canvas";
import { CanvasMode } from "../../../../types/canvas";
import { Button, Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import { ScriptData, ScriptListData } from "backend/src/types/scripts";
import LoadingSpinner from "../../../../components/LoadingSpinner";

interface OwnProps {
  script: ScriptListData;
  render: any;
}

type Props = OwnProps;

const ViewScriptModal: React.FC<Props> = props => {
  const { script, render } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const [scriptData, setScriptData] = useState<ScriptData | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const getScript = async (scriptId: number) => {
    const data = await api.scripts.getScript(scriptId);
    setScriptData(data);
  };

  useEffect(() => {
    getScript(script.id);
    setIsLoading(false);
  }, []);

  return (
    <>
      <Dialog open={isOpen} fullWidth onBackdropClick={toggleVisibility}>
        <DialogTitle>{`Viewing script ${script.filename}`}</DialogTitle>
        <DialogContent>
          <Button color="primary" onClick={toggleVisibility}>
            Close
          </Button>
        </DialogContent>
        {isLoading && (
          <LoadingSpinner loadingMessage="Loading script template..." />
        )}
        {!scriptData && <>This script does not exist</>}
        {scriptData &&
          scriptData.pages.map((page, index) => {
            return <img src={page.imageUrl} />;
          })}
      </Dialog>
      {render(toggleVisibility)}
    </>
  );
};

export default ViewScriptModal;
