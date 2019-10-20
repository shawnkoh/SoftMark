import { DiscardableData } from "./entities";

export interface QuestionTemplatePostData {
  name: string;
  marks: number;
}

export type QuestionTemplateListData = QuestionTemplatePostData &
  DiscardableData;

export interface QuestionTemplateData extends QuestionTemplateListData {}
