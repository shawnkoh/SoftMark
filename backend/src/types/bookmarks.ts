import { DiscardableData } from "./entities";

export interface BookmarkPostData {
  paperUserId: number;
}

export interface BookmarkListData {
  questionId: number;
  paperUserId: number;
}

export interface BookmarkData extends BookmarkListData {}
