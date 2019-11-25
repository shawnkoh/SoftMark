import React from "react";
import TreeSelect, { TreeNode } from "antd/es/tree-select";
import { QuestionTemplateTreeData } from "backend/src/types/questionTemplates";
import useScriptSetup from "AuthenticatedApp/paperSetup/context/ScriptSetupContext";
import { useFormikContext } from "formik";
import { NewQuestionTemplateValues } from "./QuestionTemplateDialog";

import "antd/es/tree-select/style/index.css";
import "antd/es/select/style/index.css";
import "antd/es/empty/style/index.css";

interface SelectTreeProps {
  container: (triggerNode: any) => any;
  selfId: number | null;
}

const GenerateTreeData = (
  questionTemplateTree: QuestionTemplateTreeData,
  selfId: number | null
): TreeNode => {
  return {
    value: "" + questionTemplateTree.id,
    title: questionTemplateTree.name,
    key: "" + questionTemplateTree.id,
    children: questionTemplateTree.childQuestionTemplates
      .filter(e => e.score === null) // no score indicates question template is a leaf
      .map(e => GenerateTreeData(e, selfId)),
    disabled: selfId === questionTemplateTree.id
  };
};

const QuestionTemplateSelect: React.FC<SelectTreeProps> = props => {
  const [parentName, setParentName] = React.useState("");
  const { setFieldValue } = useFormikContext<NewQuestionTemplateValues>();
  const { scriptTemplateSetupData } = useScriptSetup();
  const treeData = scriptTemplateSetupData.questionTemplates
    .filter(e => e.displayPage === null)
    .map(d => GenerateTreeData(d, props.selfId));
  return (
    <TreeSelect
      showSearch
      style={{ width: "100%" }}
      value={parentName}
      dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
      placeholder="No parent (click to select)"
      allowClear
      onChange={(v: string, l: string) => {
        setFieldValue("parentQuestionTemplateId", v);
        setParentName(l);
      }}
      treeData={treeData}
      getPopupContainer={props.container}
    />
  );
};

export default QuestionTemplateSelect;
