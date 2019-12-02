import { DiscardableData, isDiscardableData, isValidDate } from "./entities";
import { isPageListData, PageData } from "./pages";
import { StudentListData } from "./paperUsers";
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
  student: StudentListData | null;
  studentId: number | null;
  studentName: string | null;
  studentEmail: string | null;
  matriculationNumber: string | null;
  hasVerifiedStudent: boolean;
  publishedDate: Date | null;
  filename: string;
  awardedMarks: number;
  pagesCount: number;
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
