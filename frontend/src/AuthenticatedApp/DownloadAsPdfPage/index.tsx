import React, { useState, useEffect } from "react";
import api from "../../api";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import { CanvasSaver } from "../../components/Canvas";
import usePaper from "../../contexts/PaperContext";
import jsPDF from "jspdf";

const DownloadAsPdfPage: React.FC = () => {
  const paper = usePaper();

  /** Script template hooks start (should be changed to script) */
  const [isLoadingScriptTemplate, setIsLoadingScriptTemplate] = useState(true);
  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);

  const getScriptTemplate = () => {
    api.scriptTemplates
      .getScriptTemplate(paper.id)
      .then(resp => setScriptTemplate(resp))
      .finally(() => setIsLoadingScriptTemplate(false));
  };

  useEffect(getScriptTemplate, []);

  const imageUrlArray: string[] = [];
  const callBackImageUrl = async (imageUrl: string) => {
    imageUrlArray.push(imageUrl);
    if (
      scriptTemplate &&
      imageUrlArray.length === scriptTemplate.pageTemplates.length
    ) {
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
      pdf.save("scriptTemplate.pdf");
    }
  };

  if (isLoadingScriptTemplate) {
    return <div>loading</div>;
  } else if (!scriptTemplate) {
    return <div>template doesnt exist</div>;
  }

  return (
    <div style={{ minHeight: "100vh", minWidth: "100vw", display: "flex" }}>
      {scriptTemplate.pageTemplates.map(pageTemplate => {
        return (
          <CanvasSaver
            callBackImageUrl={callBackImageUrl}
            backgroundAnnotations={[
              [
                {
                  points: [
                    432,
                    81.79999923706055,
                    436,
                    84.79999923706055,
                    491,
                    132.79999923706055,
                    492,
                    134.79999923706055,
                    494,
                    136.79999923706055,
                    496,
                    137.79999923706055,
                    496,
                    138.79999923706055,
                    496,
                    140.79999923706055,
                    497,
                    141.79999923706055,
                    499,
                    142.79999923706055,
                    499,
                    144.79999923706055,
                    500,
                    146.79999923706055,
                    527,
                    238.79999923706055,
                    529,
                    252.79999923706055,
                    531
                  ],
                  type: "source-over",
                  width: 2,
                  color: "#ff0000"
                }
              ]
            ]}
            backgroundImageSource={pageTemplate.imageUrl}
          />
        );
      })}
    </div>
  );
};

export default DownloadAsPdfPage;
