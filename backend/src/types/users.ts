import { DiscardableData, isDiscardableData } from "./entities";

export interface UserPostData {
  email: string;
  password?: string | null;
  name?: string;
}

export interface UserPatchData {
  email: string;
  name: string | null;
}

export interface UserListData extends DiscardableData {
  email: string;
  emailVerified: boolean;
  name: string | null;
}

export interface UserData extends UserListData {}

export function isUserListData(data: any): data is UserListData {
  return (
    typeof data.email === "string" &&
    typeof data.emailVerified === "boolean" &&
    (typeof data.name === "string" || data.name === null) &&
    isDiscardableData(data)
  );
}

export function isUserData(data: any): data is UserData {
  return isUserListData(data);
}
