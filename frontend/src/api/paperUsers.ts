import { AxiosResponse } from "axios";

import client from "./client";
import {
  PaperUserPostData,
  PaperUserRole,
  PaperUserListData,
  PaperUserData
} from "../types/paperUsers";

const URL = "/paper_users";

export async function postStudents(
  paperId: number,
  file: File,
  onSuccess: (name: string) => void,
  onFail: (name: string) => void,
  refresh: () => void
) {
  const reader = new FileReader();
  reader.onloadend = async (e: any) => {
    const rows: string[] = e.target.result.split("\n");
    await Promise.all(
      rows.map(row => {
        if (row) {
          const cells = row.split("\r")[0].split(",");
          if (cells.length >= 3) {
            const name = cells[1];
            const paperUserPostData: PaperUserPostData = {
              matriculationNumber: cells[0],
              name: name,
              email: cells[2],
              role: PaperUserRole.Student
            };
            return createPaperUser(paperId, paperUserPostData)
              .then(() => {
                onSuccess(name);
              })
              .catch(() => onFail(name));
          }
        }
      })
    );
    refresh();
  };
  reader.readAsText(file);
}

export async function createPaperUser(
  id: number,
  paperUserPostData: PaperUserPostData
): Promise<AxiosResponse<{ paperUser: PaperUserData }>> {
  return client.post(`papers/${id}/users`, paperUserPostData);
}

export async function getMarkers(
  id: number
): Promise<AxiosResponse<{ paperUsers: PaperUserListData[] }>> {
  return client.get(`papers/${id}/markers`);
}

export async function getStudents(
  id: number
): Promise<AxiosResponse<{ paperUsers: PaperUserListData[] }>> {
  return client.get(`papers/${id}/students`);
}

export async function getUnmatchedStudents(
  id: number
): Promise<AxiosResponse<{ paperUsers: PaperUserListData[] }>> {
  return client.get(`papers/${id}/unmatched_students`);
}

export async function patchStudent(
  id: number,
  data
): Promise<AxiosResponse<{ paperUser: PaperUserData }>> {
  return client.patch(`${URL}/${id}/students`, data);
}

export async function discardPaperUser(id: number): Promise<AxiosResponse> {
  return client.delete(`${URL}/${id}`);
}
