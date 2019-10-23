import { DiscardableData } from "./entities";
import { QuestionListData } from "./questions";
import { PaperUserListData } from "./paperUsers";

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

export interface MarkData extends MarkListData {
  question: QuestionListData;
  paperUser: PaperUserListData;
}
