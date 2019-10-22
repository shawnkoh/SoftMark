import { BookmarkListData } from "./bookmarks";
import { CommentListData } from "./comments";
import { DiscardableData } from "./entities";
import { MarkListData } from "./marks";
import { PageQuestionListData } from "./pageQuestions";

export interface QuestionPostData {}

export interface QuestionListData extends DiscardableData {
  questionTemplateId: number;
  scriptId: number;
  pageQuestionsCount: number;
  marksCount: number;
  bookmarksCount: number;
}

export interface QuestionData extends QuestionListData {
  pageQuestions: PageQuestionListData[];
  marks: MarkListData[];
  bookmarks: BookmarkListData[];
}
