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
    value: questionTemplateTree.name,
    title: questionTemplateTree.name,
    key: "" + questionTemplateTree.id,
    children: questionTemplateTree.childQuestionTemplates.map(e =>
      GenerateTreeData(e)
    )
  };
};

const QuestionTemplateSelect: React.FC<SelectTreeProps> = props => {
  const { values, setFieldValue } = useFormikContext<
    NewQuestionTemplateValues
  >();
  const { scriptTemplateSetupData } = useScriptSetup();
  const treeData = scriptTemplateSetupData.questionTemplates.map(d =>
    GenerateTreeData(d)
  );
  return (
    <TreeSelect
      showSearch
      style={{ width: "100%" }}
      value={values.parentName}
      dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
      placeholder="Please select"
      allowClear
      treeDefaultExpandAll
      onChange={(v: string) => {
        setFieldValue("parentName", v);
      }}
      treeData={treeData}
      getPopupContainer={props.container}
    />
  );
};

export default QuestionTemplateSelect;
