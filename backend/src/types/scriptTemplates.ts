import {
  QuestionTemplatePostData,
  QuestionTemplateListData,
  QuestionTemplatePatchData
} from "./questionTemplates";
import { DiscardableData } from "./entities";

export interface ScriptTemplatePostData {
  questionTemplates: QuestionTemplatePostData[];
}

export interface ScriptTemplatePatchData {
  questionTemplates: (QuestionTemplatePostData | QuestionTemplatePatchData)[];
}

export interface ScriptTemplateData extends DiscardableData {
  questionTemplates: QuestionTemplateListData[];
}
