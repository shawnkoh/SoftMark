import { AxiosResponse } from "axios";
import {
  InviteData,
  InvitePostData,
  NominalRollPostData
} from "backend/src/types/paperUsers";
import {
  PaperUserData,
  PaperUserListData,
  PaperUserPostData
} from "../types/paperUsers";
import client from "./client";
import { AuthenticationData } from "backend/src/types/auth";

const URL = "/paper_users";

export async function createStudents(
  id: number,
  nominalRollPostData: NominalRollPostData
): Promise<
  AxiosResponse<{ successfullyAdded: string; failedToBeAdded: string }>
> {
  return client.post(`papers/${id}/multiple_students`, nominalRollPostData, {
    timeout: 1000000
  });
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
