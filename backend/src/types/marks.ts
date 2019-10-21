import { DiscardableData } from "./entities";

export interface MarkPostData {
  paperUserId: number;
}

export interface MarkPatchData {
  score: number;
}

export interface MarkListData extends DiscardableData {
  questionId: number;
  paperUserId: number;
  score: number;
}

export interface MarkData extends MarkListData {}
