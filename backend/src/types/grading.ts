import { UserListData } from "./users";

export interface QuestionTemplateGradingRootData {
  id: number;
  name: string;
  totalScore: number | null;
  markers: number[];
  questionCount: number;
  markCount: number;
}

export interface GradingData {
  rootQuestionTemplates: QuestionTemplateGradingRootData[];
  markers: UserListData[];
  totalQuestionCount: number;
  totalMarkCount: number;
}
