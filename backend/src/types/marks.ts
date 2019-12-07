import { DiscardableData, isDiscardableData } from "./entities";

export interface MarkPutData {
  score: number;
  // TODO: Not in MVP
  // timeSpent: number;
}

export interface MarkPatchData {
  score: number;
  // timeSpent: number;
}

export interface MarkData extends DiscardableData {
  questionId: number;
  markerId: number;
  score: number;
  // TODO: Not in MVP
  // timeSpent: number;
}

export interface MarkExportData {
  scriptId: number;
  filename: string;
  matriculationNumber: string | null;
  name: string | null;
  email: string | null;
  total: number;
  // Theres also N types based on the question templates, not sure how to type it since it's a runtime value
}

export function isMarkData(data: any): data is MarkData {
  return (
    typeof data.questionId === "number" &&
    typeof data.markerId === "number" &&
    typeof data.score === "number" &&
    isDiscardableData(data)
  );
}
