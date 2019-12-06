import { AnnotationLine } from "./annotations";

// TODO: Collapse all the types into their respective entities

export interface QuestionViewData {
  displayPage: number;
  id: number;
  leftOffset: number;
  markId: number | null;
  maxScore: number;
  name: string;
  score: number | null;
  topOffset: number;
}

export interface AnnotationViewData {
  id: number;
  layer: AnnotationLine[];
}

export interface PageViewData {
  annotations: AnnotationViewData[];
  id: number;
  imageUrl: string;
  pageNo: number;
  // DEPRECATED - replaced with QuestionViewData.displayPage
  questionIds: number[];
}

export interface QuestionTemplateViewData {
  id: number;
  name: string;
}

export interface ScriptViewData {
  filename: string;
  id: number;
  matriculationNumber: string | null;
  pages: PageViewData[];
  questions: QuestionViewData[];
  studentId: number | null;
}

export interface ScriptDownloadData {
  filename: string;
  id: number;
  matriculationNumber: string | null;
  pages: PageViewData[];
  questions: QuestionViewData[];
  studentId: number | null;
}

export interface ScriptMarkingData extends ScriptDownloadData {
  canMark: boolean;
  nextScriptId: number | null;
  previousScriptId: number | null;
  rootQuestionTemplate: QuestionTemplateViewData;
}
