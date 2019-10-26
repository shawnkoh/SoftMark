import { DiscardableData } from "./entities";
import { QuestionListData } from "./questions";
import { PageListData } from "./pages";

export interface ScriptPostData {
  email: string;
  imageUrls: string[];
}

export interface ScriptListData extends DiscardableData {
  paperUserId: number;
  paperId: number;
  pagesCount: number;
  questionsCount: number;
  imageUrls: string[];
  imageUrlCount: number;
}

export interface ScriptData extends ScriptListData {
  pages: PageListData[];
  questions: QuestionListData[];
}
