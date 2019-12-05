import { StudentListData } from "../types/paperUsers";
import client from "./client";

export async function getStudents(paperId: number) {
  return client.get<{ students: StudentListData[] }>(
    `papers/${paperId}/students`
  );
}

export async function getUnmatchedStudents(id: number) {
  return client.get<{ students: StudentListData[] }>(
    `papers/${id}/unmatched_students`
  );
}
