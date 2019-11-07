import { AxiosResponse } from "axios";
import { UserData, UserPatchData } from "backend/src/types/users";

import client from "./client";

const URL = "/users";

export async function createNewUser(
  name: string,
  email: string,
  password: string
): Promise<AxiosResponse> {
  return client.post(`${URL}`, {
    name: name,
    email: email,
    password: password
  });
}

export async function requestResetPassword(
  email: string
): Promise<AxiosResponse> {
  return client.post(`${URL}/resetverification`, {
    email: email
  });
}

export async function resetPassword(
  email: string,
  verificationCode: string,
  newPassword: string
): Promise<AxiosResponse> {
  return client.post(`${URL}/reset`, {
    email: email,
    verification_code: verificationCode,
    password: newPassword
  });
}

export async function verifyAccount(
  email: string,
  verificationCode: string
): Promise<AxiosResponse> {
  return client.post(`${URL}/verify`, {
    email: email,
    verification_code: verificationCode
  });
}

export async function getUser(id: number): Promise<AxiosResponse<UserData>> {
  return client.get(`${URL}/${id}`);
}

export async function patchOwnUser(
  userData: UserPatchData
): Promise<AxiosResponse<{ user: UserData }>> {
  return client.patch(`${URL}/self`, userData);
}

export async function getOwnUser(): Promise<UserData | null> {
  try {
    const { data } = await client.get<{ user: UserData }>(`${URL}/self`);
    return data.user;
  } catch (error) {
    return null;
  }
}
