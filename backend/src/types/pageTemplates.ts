import { QuestionTemplateListData } from "./questionTemplates";
import { DiscardableData } from "./entities";

export interface PageTemplateListData extends DiscardableData {}

export interface PageTemplateData extends PageTemplateListData {
  questionTemplates: QuestionTemplateListData[];
}
