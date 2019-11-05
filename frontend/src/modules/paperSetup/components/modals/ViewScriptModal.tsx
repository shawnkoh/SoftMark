import React, { useState, useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import api from "../../../../api";
import TogglePageComponent from "../../../../components/misc/TogglePageComponent";
import Canvas from "../../../scripts/components/annotator/Canvas";
import { CanvasMode } from "../../../../types/canvas";
import { Button, Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import { ScriptData } from "backend/src/types/scripts";
import LoadingSpinner from "../../../../components/loading/LoadingSpinner";

interface OwnProps {
  script: ScriptData;
  children: (f: () => void) => React.FC;
}

type Props = OwnProps;

const ViewScriptModal: React.FC<Props> = props => {
  const { script, children } = props;
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const [scriptData, setScriptData] = useState<ScriptData | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.scripts
      .getScript(script.id)
      .then(resp => {
        setScriptData(resp.data.script);
      })
      .finally(() => setIsLoading(false));
  }, []);

  console.log(scriptData);

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
      {children(toggleVisibility)}
    </>
  );
};

export default withRouter(ViewScriptModal);
