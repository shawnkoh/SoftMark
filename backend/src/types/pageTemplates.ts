import { QuestionTemplateListData } from "./questionTemplates";
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
