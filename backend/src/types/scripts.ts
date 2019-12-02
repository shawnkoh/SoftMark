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
  completedMarking: boolean;
  filename: string;
  hasVerifiedStudent: boolean;
  matriculationNumber: string | null;
  pageCount: number;
  publishedDate: Date | null;
  studentEmail: string | null;
  studentId: number | null;
  studentName: string | null;
  totalScore: number;
}

export interface ScriptData extends ScriptListData {
  pages: PageData[];
  questions: QuestionListData[];
}

export function isScriptListData(data: any): data is ScriptListData {
  return (
    typeof data.completedMarking === "boolean" &&
    typeof data.filename === "string" &&
    typeof data.hasVerifiedStudent === "boolean" &&
    (typeof data.matriculationNumber === "string" ||
      data.matriculationNumber === null) &&
    typeof data.pageCount === "number" &&
    isValidDate(data.publishedDate) &&
    (typeof data.studentEmail === "string" || data.studentEmail === null) &&
    (typeof data.studentId === "number" || data.studentId === null) &&
    (typeof data.studentName === "string" || data.studentName === null) &&
    typeof data.totalScore === "number" &&
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
