import React from "react";
import { useParams } from "react-router";
import ScriptsDownloader from "./components/ScriptsDownloader"

const DownloadSingleScriptPage: React.FC = () => {
  const { scriptId } = useParams();
  const scriptIds = [Number(scriptId)];
  return <ScriptsDownloader scriptIds={scriptIds}/>;
};

export default DownloadSingleScriptPage;
