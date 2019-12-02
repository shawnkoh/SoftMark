import { DiscardableData, isDiscardableData, isValidDate } from "./entities";
import { isPageListData, PageData } from "./pages";
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
  hasVerifiedStudent: boolean;
  publishedDate: Date | null;
  filename: string;
  awardedMarks: number;
  pageCount: number;
  completedMarking: boolean;
  studentId: number | null;
  matriculationNumber: string | null;
  studentName: string | null;
  studentEmail: string | null;
}

export interface ScriptData extends ScriptListData {
  pages: PageData[];
  questions: QuestionListData[];
}

export function isScriptListData(data: any): data is ScriptListData {
  return (
    typeof data.paperId === "number" &&
    typeof data.pagesCount === "number" &&
    isValidDate(data.publishedDate) &&
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
