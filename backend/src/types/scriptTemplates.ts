import { DiscardableData } from "./entities";
import { PageTemplateListData, isPageTemplateListData } from "./pageTemplates";
import {
  QuestionTemplateListData,
  isQuestionTemplateListData
} from "./questionTemplates";

export interface ScriptTemplatePostData {
  name?: string | null;
  // pdf: something
}

export interface ScriptTemplatePatchData {
  name?: string | null;
}

export interface ScriptTemplateData extends DiscardableData {
  pageTemplates: PageTemplateListData[];
  questionTemplates: QuestionTemplateListData[];
}

export function isScriptTemplateData(data: any): data is ScriptTemplateData {
  return (
    !data.pageTemplates.some(
      (pageTemplate: any) => !isPageTemplateListData(pageTemplate)
    ) &&
    !data.questionTemplates.some(
      (questionTemplate: any) => !isQuestionTemplateListData(questionTemplate)
    )
  );
}
