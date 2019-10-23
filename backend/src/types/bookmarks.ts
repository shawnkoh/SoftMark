import { QuestionListData } from "./questions";
import { PaperUserListData } from "./paperUsers";

export interface BookmarkPostData {
  paperUserId: number;
}

export interface BookmarkListData {
  questionId: number;
  paperUserId: number;
}

export interface BookmarkData extends BookmarkListData {
  question: QuestionListData;
  paperUser: PaperUserListData;
}
