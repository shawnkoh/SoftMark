import { DiscardableData, isDiscardableData } from "./entities";

export interface CommentPostData {}

export interface CommentListData extends DiscardableData {}

export interface CommentData extends CommentListData {}

export function isCommentListData(data: any): data is CommentListData {
  return isDiscardableData(data);
}

export function isCommentData(data: any): data is CommentData {
  return isCommentListData(data);
}
