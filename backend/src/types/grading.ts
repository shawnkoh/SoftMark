import { AnnotationLine } from "./annotations";

export interface QuestionGradingData {
  id: number;
  name: string;
  score: number | null;
  maxScore: number | null;
  topOffset: number | null;
  leftOffset: number | null;
  parentQuestionId: number | null;
}

export interface AnnotationGradingData {
  id: number;
  layer: AnnotationLine[];
}

export interface PageGradingData {
  id: number;
  pageNo: number;
  imageUrl: string;
  annotations: AnnotationGradingData[];
  questionIds: number[];
}

export interface GradingData {
  matriculationNumber: string | null;
  parentQuestion: QuestionGradingData;
  childQuestions: QuestionGradingData[];
  pages: PageGradingData[];
}
