import { BaseData, isBaseData } from "./entities";
import { isPaperUserListData, PaperUserListData } from "./paperUsers";
import { isQuestionListData, QuestionListData } from "./questions";

export interface BookmarkPostData {
  paperUserId: number;
}

export interface BookmarkListData extends BaseData {
  questionId: number;
  paperUserId: number;
}

export interface BookmarkData extends BookmarkListData {
  question: QuestionListData;
  paperUser: PaperUserListData;
}

export function isBookmarkListData(data: any): data is BookmarkListData {
  return (
    typeof data.questionid === "number" &&
    typeof data.paperUserId === "number" &&
    isBaseData(data)
  );
}

export function isBookmarkData(data: any): data is BookmarkData {
  return (
    isQuestionListData(data.question) &&
    isPaperUserListData(data.paperUser) &&
    isBookmarkListData(data)
  );
}
