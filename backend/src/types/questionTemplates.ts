import { DiscardableData } from "./entities";

export interface QuestionTemplatePostData {
  name: string;
  marks: number;
}

export interface QuestionTemplateListData extends DiscardableData {
  name: string;
  marks: number;
  parentQuestionTemplateId: number | null;
}

export interface QuestionTemplateData extends QuestionTemplateListData {
  childQuestionTemplates: QuestionTemplateListData[];
}
