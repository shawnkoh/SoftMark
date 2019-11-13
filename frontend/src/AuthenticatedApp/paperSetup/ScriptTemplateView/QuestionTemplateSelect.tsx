import React from "react";
import { TreeSelect } from "antd";
import "./styles.css";
import { QuestionTemplateTreeData } from "backend/src/types/questionTemplates";

interface TreeData {
  value: string;
  title: string;
  key: string;
  children: TreeData[];
}

interface SelectTreeProps {
  questionTemplateTrees: QuestionTemplateTreeData[];
  initialValue: string;
  onChange: (value: any) => void;
  container: (triggerNode: any) => any;
}

const GenerateTreeData = (questionTemplateTree: QuestionTemplateTreeData) => {
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
  const [value, setValue] = React.useState(props.initialValue);
  const treeData = props.questionTemplateTrees.map(d => GenerateTreeData(d));
  return (
    <TreeSelect
      showSearch
      style={{ width: "100%" }}
      value={value}
      dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
      placeholder="Please select"
      allowClear
      treeDefaultExpandAll
      onChange={(v: string) => {
        setValue(v);
        props.onChange(v);
      }}
      treeData={treeData}
      getPopupContainer={props.container}
    />
  );
};

export default QuestionTemplateSelect;
