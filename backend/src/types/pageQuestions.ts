import { DiscardableData, isDiscardableData } from "./entities";
import { PageListData, isPageListData } from "./pages";
import { QuestionListData, isQuestionListData } from "./questions";

export interface PageQuestionPostData {}

export interface PageQuestionListData extends DiscardableData {
  pageId: number;
  questionId: number;
}

export interface PageQuestionData extends PageQuestionListData {
  page: PageListData;
  question: QuestionListData;
}

export function isPageQuestionListData(
  data: any
): data is PageQuestionListData {
  return (
    typeof data.pageId === "number" &&
    data.questionId === "number" &&
    isDiscardableData(data)
  );
}

export function isPageQuestionData(data: any): data is PageQuestionData {
  return (
    isPageListData(data.page) &&
    isQuestionListData(data.question) &&
    isPageQuestionListData(data)
  );
}
