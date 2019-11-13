import { AnnotationLine } from "./annotations";

// TODO: Collapse all the types into their respective entities

export interface QuestionViewData {
  id: number;
  name: string;
  score: number | null;
  maxScore: number | null;
  topOffset: number | null;
  leftOffset: number | null;
}

export interface AnnotationViewData {
  id: number;
  layer: AnnotationLine[];
}

export interface PageViewData {
  id: number;
  pageNo: number;
  imageUrl: string;
  annotations: AnnotationViewData[];
  questionIds: number[];
}

export interface ScriptViewData {
  // it can be null because of either
  // 1. the student doesnt have a matriculation number tagged to it
  // 2. or there is no student tagged to it
  studentId: number | null; // refers to paperUserId
  matriculationNumber: string | null;
  rootQuestion: QuestionViewData;
  descendantQuestions: QuestionViewData[];
  pages: PageViewData[];
}
