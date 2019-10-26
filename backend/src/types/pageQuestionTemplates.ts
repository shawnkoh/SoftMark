import { DiscardableData, isDiscardableData } from "./entities";
import { PageTemplateListData, isPageTemplateListData } from "./pageTemplates";
import {
  QuestionTemplateListData,
  isQuestionTemplateListData
} from "./questionTemplates";

export interface PageQuestionTemplatePostData {
  pageTemplateId: number;
  questionTemplateId: number;
}

export interface PageQuestionTemplatePatchData {
  // Intentionally require both
  pageTemplateId: number;
  questionTemplateId: number;
}

export interface PageQuestionTemplateListData extends DiscardableData {
  pageTemplateId: number;
  questionTemplateId: number;
}

export interface PageQuestionTemplateData extends PageQuestionTemplateListData {
  pageTemplate: PageTemplateListData;
  questionTemplate: QuestionTemplateListData;
}

export function isPageQuestionTemplatePostData(
  data: any
): data is PageQuestionTemplatePostData {
  return (
    typeof data.pageTemplateId === "number" &&
    typeof data.questionTemplateId === "number"
  );
}

export function isPageQuestionTemplatePatchData(
  data: any
): data is PageQuestionTemplatePatchData {
  return (
    typeof data.pageTemplateId === "number" &&
    typeof data.questionTemplateId === "number"
  );
}

export function isPageQuestionTemplateListData(
  data: any
): data is PageQuestionTemplateListData {
  return (
    typeof data.pageTemplateId === "number" &&
    typeof data.questionTemplateId === "number" &&
    isDiscardableData(data)
  );
}

export function isPageQuestionTemplateData(
  data: any
): data is PageQuestionTemplateData {
  return (
    isPageTemplateListData(data.pageTemplate) &&
    isQuestionTemplateListData(data.questionTemplate) &&
    isPageQuestionTemplateListData(data)
  );
}
