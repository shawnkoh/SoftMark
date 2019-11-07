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
  onFail: (name: string) => void
) {
  const reader = new FileReader();
  reader.onloadend = (e: any) => {
    const rows: string[] = e.target.result.split("\n");
    Promise.all(
      rows.map(row => {
        if (row) {
          var cells = row.split(",");
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

    for (let i = 0; i < rows.length; i++) {
      var row = rows[i];
    }
  };
  reader.readAsText(file);
}

export async function createPaperUser(
  id: number,
  paperUserPostData: PaperUserPostData
): Promise<AxiosResponse<{ paperUser: PaperUserData }>> {
  return client.post(`papers/${id}/users`, paperUserPostData);
}

export async function getStudents(
  id: number
): Promise<AxiosResponse<{ paperUsers: PaperUserListData[] }>> {
  return client.get(`papers/${id}/students`);
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
