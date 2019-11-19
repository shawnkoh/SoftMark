import { AxiosResponse } from "axios";
import { PaperData } from "backend/src/types/papers";
import { InviteData, InvitePostData } from "backend/src/types/paperUsers";
import {
  PaperUserData,
  PaperUserListData,
  PaperUserPostData,
  PaperUserRole
} from "../types/paperUsers";
import client from "./client";
import { AuthenticationData } from "backend/src/types/auth";
import { timeout } from "q";

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
    let studentsUploaded = 0;
    let studentsLeft = rows.length;
    const asynchronousPostStudent = async (index: number, limit: number) => {
      if (index < limit) {
        const row = rows[index];
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
              studentsUploaded++;
              if (studentsUploaded % 100 === 0) {
                setTimeout(refresh, 5000);
              }
              asynchronousPostStudent(index + 1, limit);
            })
            .catch(() => onFail(name))
            .finally(() => {
              studentsLeft--;
              if (studentsLeft <= 3) {
                setTimeout(refresh, 4000);
              }
            });
        }
      }
    };
    const threads = 5;
    let prevUpperLimitForIndex = 0;
    let upperLimitForIndex = 0;
    for (let i = 1; i <= threads; i++) {
      upperLimitForIndex = Math.floor((i / threads) * rows.length);
      if (prevUpperLimitForIndex !== upperLimitForIndex) {
        asynchronousPostStudent(prevUpperLimitForIndex, upperLimitForIndex);
        prevUpperLimitForIndex = upperLimitForIndex;
      }
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

export async function discardStudentsOfPaper(
  paperId: number
): Promise<AxiosResponse> {
  return client.delete(`papers/${paperId}/all_students`, { timeout: 500000 });
}

export async function checkInvite(token: string) {
  return client.get<{ invite: InviteData }>(`${URL}/invite`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function replyInvite(token: string, data: InvitePostData) {
  return client.post<AuthenticationData>(`${URL}/invite`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
