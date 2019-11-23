export interface QuestionTemplateGradingRootData {
  id: number;
  name: string;
  totalScore: number | null;
  markers: number[];
  questionCount: number;
  markCount: number;
}

export interface MarkerGradingData {
  id: number; // refers to userId
  email: string;
  emailVerified: boolean;
  name: string | null;
}

export interface GradingData {
  rootQuestionTemplates: QuestionTemplateGradingRootData[];
  markers: MarkerGradingData[];
  totalQuestionCount: number;
  totalMarkCount: number;
}
