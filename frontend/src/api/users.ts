import { AxiosResponse } from "axios";
import { UserData, UserPatchData } from "backend/src/types/users";
import client from "./client";

const URL = "/users";

export async function createNewUser(
  email: string,
  password?: string,
  name?: string
): Promise<
  AxiosResponse<{
    user: UserData;
    accessToken: string;
    refreshToken: string;
  }>
> {
  return client.post(`${URL}`, {
    email,
    name,
    password
  });
}

export async function requestResetPassword(email: string): Promise<boolean> {
  try {
    await client.post(`${URL}/request_reset_password`, { email });
    return true;
  } catch (error) {
    return false;
  }
}

export async function resetPassword(
  token: string,
  password: string
): Promise<boolean> {
  try {
    await client.post(
      `${URL}/reset_password`,
      { password },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return true;
  } catch (error) {
    return false;
  }
}

export async function verifyEmail(token: string): Promise<boolean> {
  try {
    await client.post(`${URL}/verify_email`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  } catch (error) {
    return false;
  }
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
