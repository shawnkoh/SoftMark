export interface UserListData {
  id: number;
  email: string;
  emailVerified: boolean;
  name?: string;
  createdAt: Date;
  updatedAt: Date
  discardedAt?: Date;
}

export interface UserData extends UserListData {
}