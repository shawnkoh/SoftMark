import { DiscardableData } from "./entities";
import { PageListData } from "./pages";
import { QuestionListData } from "./questions";

export interface PageQuestionPostData {}

export interface PageQuestionListData extends DiscardableData {
  pageId: number;
  questionId: number;
}

export interface PageQuestionData extends PageQuestionListData {
  page: PageListData;
  question: QuestionListData;
}
