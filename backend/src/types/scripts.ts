import { DiscardableData, isDiscardableData } from "./entities";
import { isPageListData, PageListData } from "./pages";
import { PaperUserListData } from "./paperUsers";
import { isQuestionListData, QuestionListData } from "./questions";

export interface ScriptPostData {
  filename: string;
  sha256: string;
  imageUrls: string[];
}

export type ScriptPatchData = Partial<{
  filename: string;
  hasVerifiedStudent: boolean;
  studentId: number;
}>;

export interface ScriptListData extends DiscardableData {
  paperId: number;
  student: PaperUserListData | null;
  hasVerifiedStudent: boolean;
  filename: string;
  awardedMarks: number;
  totalMarks: number;
  pagesCount: number;
  questionsCount: number;
}

export interface ScriptData extends ScriptListData {
  pages: PageListData[];
  questions: QuestionListData[];
}

export function isScriptListData(data: any): data is ScriptListData {
  return (
    typeof data.paperId === "number" &&
    typeof data.pagesCount === "number" &&
    typeof data.questionsCount === "number" &&
    isDiscardableData(data)
  );
}

export function isScriptData(data: any): data is ScriptData {
  return (
    data.pages.every((page: any) => isPageListData(page)) &&
    data.questions.every((question: any) => isQuestionListData(question)) &&
    isScriptListData(data)
  );
}
