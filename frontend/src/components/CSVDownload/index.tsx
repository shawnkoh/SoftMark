import Papa, { UnparseConfig, UnparseObject } from "papaparse";
import React, { useState } from "react";
import { toast } from "react-toastify";

// Adapted from https://gist.github.com/dhunmoon/d743b327c673b589e7acfcbc5633ff4b

interface Props {
  config?: UnparseConfig;
  data: Array<Object> | Array<Array<any>> | UnparseObject | null;
  filename: string;
  // TODO: Not sure how to type this
  render: any;
}

const CSVDownload: React.FC<Props> = props => {
  const { data, render, config, filename } = props;
  const [isExporting, setExporting] = useState(false);
  const exportCsv = () => setExporting(true);

  React.useEffect(() => {
    if (!data || !isExporting) {
      return;
    }
    const csv = Papa.unparse(data, config);
    const blob = new Blob([csv], { type: "text/csv; charset=utf-8;" });
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob);
      return;
    }
    const link = document.createElement("a");
    if (link.download === undefined) {
      toast.error("Your browser does not support downloading files");
      return;
    }
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExporting(false);
  }, [data, isExporting]);

  return render(exportCsv);
};

export default CSVDownload;
