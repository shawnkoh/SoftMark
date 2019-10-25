import { DiscardableData } from "./entities";
import { PageTemplateListData } from "./pageTemplates";

export interface QuestionTemplatePostData {
  name: string;
  parentName?: string | null;
  score: number | null;
}

export type QuestionTemplatePatchData = Partial<QuestionTemplatePostData>;

export function isQuestionTemplatePostData(
  data: any
): data is QuestionTemplatePostData {
  return typeof data.name === "string" && typeof data.marks === "number";
}

export function isQuestionTemplatePatchData(
  data: any
): data is QuestionTemplatePatchData {
  return typeof data.id === "number";
}

export interface QuestionTemplateListData extends DiscardableData {
  name: string;
  score: number | null;
  parentQuestionTemplateId: number | null;
}

export interface QuestionTemplateData extends QuestionTemplateListData {
  childQuestionTemplates: QuestionTemplateListData[];
  pageTemplates: PageTemplateListData[];
}
