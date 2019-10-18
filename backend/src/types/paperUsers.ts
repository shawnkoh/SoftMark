import { AllocationListData } from "./allocations";
import { DiscardableData } from "./entities";

export enum PaperUserRole {
  Owner = "OWNER",
  Marker = "MARKER",
  Student = "STUDENT"
}

export function isPaperUserRole(role: any): role is PaperUserRole {
  return Object.values(PaperUserRole).includes(role);
}

export interface PaperUserListData extends DiscardableData {
  role: PaperUserRole;
  allocations: AllocationListData[];
  markCount: number;
  bookmarkCount: number;
}
