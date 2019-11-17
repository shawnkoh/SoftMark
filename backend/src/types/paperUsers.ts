import { AllocationListData, isAllocationListData } from "./allocations";
import { DiscardableData } from "./entities";
import { isUserData, UserData } from "./users";

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
  name?: string;
  matriculationNumber?: string;
}

export type PaperUserPatchData = Partial<{
  role: PaperUserRole;
  matriculationNumber: string | null;
}>;

export interface PaperUserListData extends DiscardableData {
  user: UserData; // intentionally nested
  role: PaperUserRole;
  matriculationNumber: string | null;
  allocations: AllocationListData[]; // intentionally nested
  markCount: number;
  bookmarkCount: number;
}

export interface InviteData {
  paperName: string;
  userName: string | null;
}

export interface InvitePostData {
  name: string | null;
  accepted: boolean;
}

export interface PaperUserData extends PaperUserListData {}

export function isPaperUserListData(data: any): data is PaperUserListData {
  return (
    isUserData(data.user) &&
    Object.values(PaperUserRole).includes(data.role) &&
    (typeof data.matriculationNumber === "number" ||
      data.matriculationNumber === null) &&
    data.allocations.every((allocation: any) =>
      isAllocationListData(allocation)
    ) &&
    typeof data.markCount === "number" &&
    typeof data.bookmarkCount === "number"
  );
}
