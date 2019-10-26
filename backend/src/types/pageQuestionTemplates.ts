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
  pageTemplateId?: number;
  questionTemplateId?: number;
}

export interface PageQuestionTemplateListData extends DiscardableData {
  pageTemplateId: number;
  questionTemplateId: number;
}

export interface PageQuestionTemplateData extends PageQuestionTemplateListData {
  pageTemplate: PageTemplateListData;
  questionTemplate: QuestionTemplateListData;
}

export function isPageQuestionTemplateListData(
  data: any
): data is PageQuestionTemplateListData {
  return (
    typeof data.pageTemplateId === "number" &&
    data.questionTemplateId === "number" &&
    isDiscardableData(data)
  );
}

export function isPageQuestionTemplateData(
  data: any
): data is PageQuestionTemplateData {
  return (
    isPageTemplateListData(data.page) &&
    isQuestionTemplateListData(data.question) &&
    isPageQuestionTemplateListData(data)
  );
}
