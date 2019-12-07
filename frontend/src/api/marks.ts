import { AxiosResponse } from "axios";
import { MarkData, MarkExportData, MarkPutData } from "backend/src/types/marks";
import client from "./client";

const URL = "/marks";

export async function replaceMark(
  questionId: number,
  data: MarkPutData
): Promise<AxiosResponse<{ mark: MarkData | null }>> {
  return client.put(`/questions/${questionId}/mark`, data);
}

export async function discardMark(markId: number) {
  return client.delete(`${URL}/${markId}`);
}

export async function undiscardMark(
  markId: number
): Promise<AxiosResponse<{ mark: MarkData }>> {
  return client.patch(`${URL}/${markId}/undiscard`);
}

export async function exportMarks(paperId: number) {
  return client.get<{ marks: MarkExportData[] }>(
    `/papers/${paperId}/export_marks`
  );
}
