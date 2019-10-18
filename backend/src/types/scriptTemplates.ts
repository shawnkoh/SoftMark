import { QuestionTemplatePostData, QuestionTemplateListData } from "./questionTemplates";
import { DiscardableData } from "./entities";

export interface ScriptTemplatePostData {
  questionTemplates: QuestionTemplatePostData[];
}

export interface ScriptTemplateData extends DiscardableData {
  questionTemplates: QuestionTemplateListData[];
}