import { DiscardableData, isDiscardableData } from "./entities";

export interface QuestionTemplatePostData {
  name: string;
  score?: number | null;
  pageCovered?: string | null;
  displayPage?: number | null;
  topOffset?: number | null;
  leftOffset?: number | null;
  parentQuestionTemplateId?: number | null;
}

export type QuestionTemplatePatchData = Partial<QuestionTemplatePostData>;

export interface QuestionTemplateData extends DiscardableData {
  displayPage: number | null;
  leftOffset: number | null;
  name: string;
  pageCovered: string | null;
  parentQuestionTemplateId: number | null;
  score: number | null;
  scriptTemplateId: number;
  topOffset: number | null;
}

export interface QuestionTemplateLeafData {
  id: number;
  name: string;
  score: number;
  displayPage: number;
  topOffset: number;
  leftOffset: number;
  pageCovered: string;
}

export interface QuestionTemplateTreeData {
  id: number;
  name: string;
  score: number | null;
  displayPage: number | null;
  childQuestionTemplates: QuestionTemplateTreeData[];
}

export function isQuestionTemplatePostData(
  data: any
): data is QuestionTemplatePostData {
  return (
    typeof data.name === "string" &&
    typeof data.marks === "number" &&
    (typeof data.topOffset === "number" || data.topOffset === null) &&
    (typeof data.leftOffset === "number" || data.leftOffset === null)
  );
}

export function isQuestionTemplatePatchData(
  data: any
): data is QuestionTemplatePatchData {
  return typeof data.id === "number";
}

export function isQuestionTemplateData(
  data: any
): data is QuestionTemplateData {
  return (
    typeof data.scriptTemplateId === "number" &&
    typeof data.name === "string" &&
    (typeof data.score === "number" || data.score === null) &&
    (typeof data.parentQuestionTemplateId === "number" ||
      data.parentQuestionTemplateId === null) &&
    (typeof data.topOffset === "number" || data.topOffset === null) &&
    (typeof data.leftOffset === "number" || data.leftOffset === null) &&
    isDiscardableData(data)
  );
}
