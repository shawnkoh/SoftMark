import { DiscardableData } from "./entities";
import { PageQuestionListData } from "./pageQuestions";
import { AnnotationListData } from "./annotations";

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
