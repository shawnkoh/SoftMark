import { DiscardableData, isDiscardableData } from "./entities";
import { PageTemplateListData, isPageTemplateListData } from "./pageTemplates";

export interface QuestionTemplatePostData {
  name: string;
  parentName?: string | null;
  score: number | null;
  topOffset: number | null;
  leftOffset: number | null;
}

export type QuestionTemplatePatchData = Partial<QuestionTemplatePostData>;

export interface QuestionTemplateListData extends DiscardableData {
  scriptTemplateId: number;
  name: string;
  score: number | null;
  parentQuestionTemplateId: number | null;
  topOffset: number | null;
  leftOffset: number | null;
}

export interface QuestionTemplateData extends QuestionTemplateListData {
  childQuestionTemplates: QuestionTemplateListData[];
  pageTemplates: PageTemplateListData[];
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

export function isQuestionTemplateListData(
  data: any
): data is QuestionTemplateListData {
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

export function isQuestionTemplateData(
  data: any
): data is QuestionTemplateData {
  return (
    data.childQuestionTemplates.every((child: any) =>
      isQuestionTemplateListData(child)
    ) &&
    data.pageTemplates.every((pageTemplate: any) =>
      isPageTemplateListData(pageTemplate)
    ) &&
    isQuestionTemplateListData(data)
  );
}
