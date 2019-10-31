import { DiscardableData } from "./entities";
import { PageTemplateListData, isPageTemplateListData } from "./pageTemplates";
import {
  QuestionTemplateListData,
  isQuestionTemplateListData
} from "./questionTemplates";

export interface ScriptTemplatePostData {
  imageUrls: string[];
}

export interface ScriptTemplatePatchData {
  imageUrls?: string[];
}

export interface ScriptTemplateData extends DiscardableData {
  pageTemplates: PageTemplateListData[];
  questionTemplates: QuestionTemplateListData[];
}

export function isScriptTemplateData(data: any): data is ScriptTemplateData {
  return (
    data.pageTemplates.every((pageTemplate: any) =>
      isPageTemplateListData(pageTemplate)
    ) &&
    data.questionTemplates.every((questionTemplate: any) =>
      isQuestionTemplateListData(questionTemplate)
    )
  );
}
