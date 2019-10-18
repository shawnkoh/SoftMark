import { DiscardableData } from "./entities";

export interface UserListData extends DiscardableData {
  email: string;
  emailVerified: boolean;
  name?: string;
}

export interface UserData extends UserListData {
}