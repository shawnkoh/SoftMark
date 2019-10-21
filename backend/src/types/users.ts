import { DiscardableData } from "./entities";

export interface UserPostData {
  email: string;
  password?: string | null;
  name: string | null;
}

export interface UserListData extends DiscardableData {
  email: string;
  emailVerified: boolean;
  name: string | null;
}

export interface UserData extends UserListData {}
