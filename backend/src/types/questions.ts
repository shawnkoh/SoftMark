import { BookmarkListData, isBookmarkListData } from "./bookmarks";
import { DiscardableData, isDiscardableData } from "./entities";
import { isMarkListData, MarkListData } from "./marks";
import { isPageQuestionListData, PageQuestionListData } from "./pageQuestions";

export interface QuestionPostData {}

export interface QuestionListData extends DiscardableData {
  questionTemplateId: number;
  scriptId: number;
  currentMarkerId: number | null;
  currentMarkerUpdatedAt: Date | null;
  pageQuestionsCount: number;
  marksCount: number;
  bookmarksCount: number;
}

export interface QuestionData extends QuestionListData {
  pageQuestions: PageQuestionListData[];
  marks: MarkListData[];
  bookmarks: BookmarkListData[];
}

export function isQuestionListData(data: any): data is QuestionListData {
  return (
    typeof data.questionTemplateId === "number" &&
    typeof data.scriptId === "number" &&
    typeof data.pageQuestionsCount === "number" &&
    typeof data.marksCount === "number" &&
    typeof data.bookmarksCount === "number" &&
    isDiscardableData(data)
  );
}

export function isQuestionData(data: any): data is QuestionData {
  return (
    data.pageQuestions.every((pageQuestion: any) =>
      isPageQuestionListData(pageQuestion)
    ) &&
    data.marks.every((mark: any) => isMarkListData(mark)) &&
    data.bookmarks.every((bookmark: any) => isBookmarkListData(bookmark)) &&
    isQuestionListData(data)
  );
}
