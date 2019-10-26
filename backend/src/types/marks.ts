import { DiscardableData, isDiscardableData } from "./entities";
import { QuestionListData, isQuestionListData } from "./questions";
import { PaperUserListData, isPaperUserListData } from "./paperUsers";

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

export function isMarkListData(data: any): data is MarkListData {
  return (
    typeof data.questionId === "number" &&
    typeof data.paperUserId === "number" &&
    typeof data.score === "number" &&
    isDiscardableData(data)
  );
}

export function isMarkData(data: any): data is MarkData {
  return (
    isQuestionListData(data.question) &&
    isPaperUserListData(data.paperUser) &&
    isMarkListData(data)
  );
}
