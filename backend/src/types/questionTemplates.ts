import { DiscardableData, isDiscardableData } from "./entities";
import { isPageTemplateListData, PageTemplateListData } from "./pageTemplates";
import { UserListData } from "./users";

export interface QuestionTemplatePostData {
  name: string;
  score?: number | null;
  pageCovered?: string | null;
  displayPage?: number | null;
  topOffset?: number | null;
  leftOffset?: number | null;
  parentName?: string | null;
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

export interface QuestionTemplateRootData {
  id: number;
  name: string;
  totalScore: number | null;
  markers: number[];
  questionCount: number;
  markCount: number;
}

export interface QuestionTemplateGradingListData {
  rootQuestionTemplates: QuestionTemplateRootData[];
  markers: UserListData[];
  totalQuestionCount: number;
  totalMarkCount: number;
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
