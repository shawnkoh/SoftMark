import {
  QuestionTemplateListData,
  isQuestionTemplateListData
} from "./questionTemplates";
import { DiscardableData, isDiscardableData } from "./entities";

export interface PageTemplateListData extends DiscardableData {}

export interface PageTemplateData extends PageTemplateListData {
  questionTemplates: QuestionTemplateListData[];
}

export function isPageTemplateListData(
  data: any
): data is PageTemplateListData {
  return isDiscardableData(data);
}

export function isPageTemplateData(data: any): data is PageTemplateData {
  return (
    data.questionTemplates.every((questionTemplate: any) =>
      isQuestionTemplateListData(questionTemplate)
    ) && isPageTemplateListData(data)
  );
}
