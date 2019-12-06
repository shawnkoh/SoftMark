import { Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import { ScriptDownloadData } from "backend/src/types/view";
import LoadingSpinner from "components/LoadingSpinner";
import jsPDF from "jspdf";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../api";
import { CanvasSaver } from "../../../components/Canvas";

interface Props {
  scriptIds: number[];
}

const DownloadAsPdfPage: React.FC<Props> = props => {
  const { scriptIds } = props;
  const [script, setScript] = useState<ScriptDownloadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptIndex, setScriptIndex] = useState(0);
  const incrementScriptIndex = () => setScriptIndex(scriptIndex + 1);
  const [isDownloading, setIsDownloading] = useState(true);

  const downloadScript = (scriptId: number) => {
    setIsLoading(true);
    api.scripts
      .downloadScript(scriptId)
      .then(resp => {
        setScript(resp.data.script);
      })
      .catch(getNextScript)
      .finally(() => setIsLoading(false));
  };

  const getNextScript = () => {
    const isValidScriptIndex = scriptIndex < scriptIds.length;
    if (isValidScriptIndex) {
      const nextScriptId = scriptIds[scriptIndex];
      downloadScript(nextScriptId);
      incrementScriptIndex();
    }
  };

  useEffect(getNextScript, []);

  if (isLoading) {
    return <LoadingSpinner loadingMessage="Loading next script..." />;
  }

  if (!script) {
    return <div>This script does not exist.</div>;
  }

  if (scriptIndex > scriptIds.length) {
    return <div>No more scripts to download.</div>;
  }

  const pages = script.pages;
  const imageUrlArray: string[] = [];
  const callBackImageUrl = async (imageUrl: string) => {
    imageUrlArray.push(imageUrl);

    const allImagesFullyLoaded = imageUrlArray.length === pages.length;

    if (allImagesFullyLoaded) {
      let pdf = new jsPDF();
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      for (let i = 0; i < imageUrlArray.length; i++) {
        if (i > 0) {
          pdf.addPage();
          pdf.setPage(i + 1);
        }
        pdf.addImage(imageUrlArray[i], "JPEG", 0, 0, width, height);
      }
      pdf.save(`${script.filename}.pdf`);

      // gets next script to download if there is one
      const isValidScriptIndex = scriptIndex < scriptIds.length;
      if (isValidScriptIndex) {
        getNextScript();
      } else {
        setIsDownloading(false);
        toast.success("No more scripts to download", { autoClose: false });
      }
    }
  };

  const getQuestionsByPageNo = (pageNo: number) =>
    script.questions.filter(question => question.displayPage === pageNo);

  return (
    <div style={{ minHeight: "100vh", minWidth: "100vw", display: "flex" }}>
      <Dialog open={isDownloading}>
        <DialogTitle>
          Browser needs to be open in order to download the script(s).
        </DialogTitle>
        <DialogContent>
          <LoadingSpinner loadingMessage="Downloading scripts..." />
        </DialogContent>
      </Dialog>
      {pages.map(page => {
        const backgroundAnnotations = page.annotations.map(
          annotation => annotation.layer
        );
        return (
          <CanvasSaver
            callBackImageUrl={callBackImageUrl}
            backgroundAnnotations={backgroundAnnotations}
            backgroundImageSource={page.imageUrl}
            questions={getQuestionsByPageNo(page.pageNo)}
          />
        );
      })}
    </div>
  );
};

export default DownloadAsPdfPage;
