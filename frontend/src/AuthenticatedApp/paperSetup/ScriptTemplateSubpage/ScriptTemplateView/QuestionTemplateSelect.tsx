import React from "react";
import { TreeSelect } from "antd";
import { QuestionTemplateTreeData } from "backend/src/types/questionTemplates";
import useScriptSetup from "AuthenticatedApp/paperSetup/context/ScriptSetupContext";
import { useFormikContext } from "formik";
import { NewQuestionTemplateValues } from "./QuestionTemplateDialog";

interface TreeData {
  value: string;
  title: string;
  key: string;
  children: TreeData[];
}

interface SelectTreeProps {
  container: (triggerNode: any) => any;
}

const GenerateTreeData = (
  questionTemplateTree: QuestionTemplateTreeData
): TreeData => {
  return {
    value: "" + questionTemplateTree.id,
    title: questionTemplateTree.name,
    key: "" + questionTemplateTree.id,
    children: questionTemplateTree.childQuestionTemplates.map(e =>
      GenerateTreeData(e)
    )
  };
};

const QuestionTemplateSelect: React.FC<SelectTreeProps> = props => {
  const [parentName, setParentName] = React.useState("");
  const { setFieldValue } = useFormikContext<NewQuestionTemplateValues>();
  const { scriptTemplateSetupData } = useScriptSetup();
  const treeData = scriptTemplateSetupData.questionTemplates.map(d =>
    GenerateTreeData(d)
  );
  return (
    <TreeSelect
      showSearch
      style={{ width: "100%" }}
      value={parentName}
      dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
      placeholder="Please select"
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
