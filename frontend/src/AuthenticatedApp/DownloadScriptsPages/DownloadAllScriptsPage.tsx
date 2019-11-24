import React from "react";
import ScriptsDownloader from "./components/ScriptsDownloader";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";

const DownloadAllScriptsPage: React.FC = () => {
  const { scripts } = useScriptsAndStudents();
  return <ScriptsDownloader scriptIds={scripts.map(script => script.id)} />;
};

export default DownloadAllScriptsPage;
