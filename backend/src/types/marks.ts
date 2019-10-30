import { DiscardableData, isDiscardableData } from "./entities";
import { PaperUserListData, isPaperUserListData } from "./paperUsers";
import { QuestionListData, isQuestionListData } from "./questions";

export interface MarkPostData {
  score: number;
  // TODO: Not in MVP
  // timeSpent: number;
}

export interface MarkPatchData {
  score: number;
  // timeSpent: number;
}

export interface MarkListData extends DiscardableData {
  questionId: number;
  markerId: number;
  score: number;
  // timeSpent: number;
}

export interface MarkData extends MarkListData {
  question: QuestionListData;
  marker: PaperUserListData;
}

export function isMarkListData(data: any): data is MarkListData {
  return (
    typeof data.questionId === "number" &&
    typeof data.markerId === "number" &&
    typeof data.score === "number" &&
    isDiscardableData(data)
  );
}

export function isMarkData(data: any): data is MarkData {
  return (
    isQuestionListData(data.question) &&
    isPaperUserListData(data.marker) &&
    isMarkListData(data)
  );
}
