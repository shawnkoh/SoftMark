import { DiscardableData, isDiscardableData } from "./entities";
import { QuestionListData, isQuestionListData } from "./questions";
import { PageListData, isPageListData } from "./pages";

export interface ScriptPostData {
  email: string;
  imageUrls: string[];
}

export interface ScriptListData extends DiscardableData {
  studentId: number | null;
  paperId: number;
  pagesCount: number;
  questionsCount: number;
}

export interface ScriptData extends ScriptListData {
  pages: PageListData[];
  questions: QuestionListData[];
}

export function isScriptListData(data: any): data is ScriptListData {
  return (
    (typeof data.studentId === "number" || data.studentId === null) &&
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
