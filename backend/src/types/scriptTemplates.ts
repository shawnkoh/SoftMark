import { DiscardableData } from "./entities";
import { QuestionTemplateListData } from "./questionTemplates";
import { PageTemplateListData } from "./pageTemplates";

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
