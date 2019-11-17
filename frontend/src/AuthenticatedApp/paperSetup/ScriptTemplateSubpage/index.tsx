import React from "react";
import { ScriptSetupProvider } from "../context/ScriptSetupContext";
import ScriptTemplateView from "./ScriptTemplateView";
import "./styles.css";

const ScriptSetup: React.FC = () => {
  return (
    <ScriptSetupProvider>
      <ScriptTemplateView />
    </ScriptSetupProvider>
  );
};

export default ScriptSetup;
