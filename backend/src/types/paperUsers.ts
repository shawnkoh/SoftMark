import { AllocationListData } from "./allocations";

export enum PaperUserRole {
  Owner = "OWNER",
  Marker = "MARKER",
  Student = "STUDENT"
}

export function isPaperUserRole(role: any): role is PaperUserRole {
  return Object.values(PaperUserRole).includes(role);
}

export interface PaperUserListData {
  id: number;
  role: PaperUserRole;
  allocations: AllocationListData[];
  markCount: number;
  bookmarkCount: number;
  createdAt: Date;
  updatedAt: Date
  discardedAt?: Date;
}
