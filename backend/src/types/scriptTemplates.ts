import { DiscardableData } from "./entities";
import { PageTemplateSetupData } from "./pageTemplates";
import {
  isQuestionTemplateData,
  QuestionTemplateData,
  QuestionTemplateTreeData
} from "./questionTemplates";

export interface ScriptTemplatePostData {
  sha256: string;
  imageUrls: string[];
}

// potentially deprecated
export interface ScriptTemplateData extends DiscardableData {
  totalMarks: number;
  pageCount: number;
  questionTemplates: QuestionTemplateData[];
}

export interface ScriptTemplateSetupData {
  id: number;
  pageTemplates: PageTemplateSetupData[];
  questionTemplates: QuestionTemplateTreeData[];
}

export function isScriptTemplateData(data: any): data is ScriptTemplateData {
  return (
    typeof data.pageCount === "number" &&
    data.questionTemplates.every((questionTemplate: any) =>
      isQuestionTemplateData(questionTemplate)
    )
  );
}
