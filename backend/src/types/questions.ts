import { BookmarkListData } from "./bookmarks";
import { CommentListData } from "./comments";
import { DiscardableData } from "./entities";
import { MarkListData } from "./marks";

export interface QuestionPostData {}

export interface QuestionListData extends DiscardableData {}

export interface QuestionData extends QuestionListData {
  marks: MarkListData[];
  comments: CommentListData[];
  bookmarks: BookmarkListData[];
}
