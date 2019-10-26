import { AllocationListData, isAllocationListData } from "./allocations";
import { DiscardableData } from "./entities";
import { UserData, isUserData } from "./users";

export enum PaperUserRole {
  Owner = "OWNER",
  Marker = "MARKER",
  Student = "STUDENT"
}

export function isPaperUserRole(role: any): role is PaperUserRole {
  return Object.values(PaperUserRole).includes(role);
}

export interface PaperUserPostData {
  email: string;
  role: PaperUserRole;
}

export type PaperUserPatchData = Partial<{
  role: PaperUserRole;
}>;

export interface PaperUserListData extends DiscardableData {
  user: UserData; // intentionally nested
  role: PaperUserRole;
  allocations: AllocationListData[]; // intentionally nested
  markCount: number;
  bookmarkCount: number;
}

export interface PaperUserData extends PaperUserListData {}

export function isPaperUserListData(data: any): data is PaperUserListData {
  return (
    isUserData(data.user) &&
    Object.values(PaperUserRole).includes(data.role) &&
    data.allocations.every((allocation: any) =>
      isAllocationListData(allocation)
    ) &&
    typeof data.markCount === "number" &&
    typeof data.bookmarkCount === "number"
  );
}
