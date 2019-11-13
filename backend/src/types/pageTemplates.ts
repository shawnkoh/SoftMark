import {
  QuestionTemplateData,
  isQuestionTemplateData,
  QuestionTemplateLeafData
} from "./questionTemplates";
import { DiscardableData, isDiscardableData } from "./entities";

export interface PageTemplateListData extends DiscardableData {
  scriptTemplateId: number;
  pageNo: number;
  imageUrl: string;
}

export interface PageTemplateData extends PageTemplateListData {
  questionTemplates: QuestionTemplateData[];
}

export interface PageTemplateSetupData {
  id: number;
  pageNo: number;
  imageUrl: string;
  questionTemplates: QuestionTemplateLeafData[];
}

export function isPageTemplateListData(
  data: any
): data is PageTemplateListData {
  return typeof data.scriptTemplateId === "number" && isDiscardableData(data);
}

export function isPageTemplateData(data: any): data is PageTemplateData {
  return (
    data.questionTemplates.every((questionTemplate: any) =>
      isQuestionTemplateData(questionTemplate)
    ) && isPageTemplateListData(data)
  );
}
