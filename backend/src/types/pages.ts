import { DiscardableData, isDiscardableData } from "./entities";
import { PageQuestionListData, isPageQuestionListData } from "./pageQuestions";
import { AnnotationListData, isAnnotationListData } from "./annotations";

export interface PagePostData {}

export interface PageListData extends DiscardableData {
  scriptId: number;
  pageQuestionsCount: number;
  annotationsCount: number;
}

export interface PageData extends PageListData {
  pageQuestions: PageQuestionListData[];
  annotations: AnnotationListData[];
}

export function isPageListData(data: any): data is PageListData {
  return (
    typeof data.scriptId === "number" &&
    typeof data.pageQuestionsCount === "number" &&
    typeof data.annotationsCount === "number" &&
    isDiscardableData(data)
  );
}

export function isPageData(data: any): data is PageData {
  return (
    data.pageQuestions.every((pageQuestion: any) =>
      isPageQuestionListData(pageQuestion)
    ) &&
    data.annotations.every((annotation: any) =>
      isAnnotationListData(annotation)
    ) &&
    isPageListData(data)
  );
}
