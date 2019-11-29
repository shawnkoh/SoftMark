import { BookmarkListData, isBookmarkListData } from "./bookmarks";
import { DiscardableData, isDiscardableData } from "./entities";
import { isMarkData, MarkData } from "./marks";

export interface QuestionListData extends DiscardableData {
  questionTemplateId: number;
  scriptId: number;
  currentMarkerId: number | null;
  currentMarkerUpdatedAt: Date | null;
  name: string;
  displayPage: number | null;
  topOffset: number | null;
  leftOffset: number | null;
  awardedMarks: number;
  totalMarks: number | null;
  marksCount: number;
  bookmarksCount: number;
}

export interface QuestionData extends QuestionListData {
  marks: MarkData[];
  bookmarks: BookmarkListData[];
}

export function isQuestionListData(data: any): data is QuestionListData {
  return (
    typeof data.questionTemplateId === "number" &&
    typeof data.scriptId === "number" &&
    typeof data.marksCount === "number" &&
    typeof data.bookmarksCount === "number" &&
    isDiscardableData(data)
  );
}

export function isQuestionData(data: any): data is QuestionData {
  return (
    data.marks.every((mark: any) => isMarkData(mark)) &&
    data.bookmarks.every((bookmark: any) => isBookmarkListData(bookmark)) &&
    isQuestionListData(data)
  );
}
