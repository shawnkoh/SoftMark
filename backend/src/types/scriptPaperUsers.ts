import { AllocationListData, isAllocationListData } from "./allocations";
import { DiscardableData } from "./entities";
import { UserData, isUserData } from "./users";

export interface ScriptPaperUserPostData {
  email: string;
}

export interface ScriptPaperUserListData extends DiscardableData {
  paperUserId: number;
  scriptPaperUser: number;
}

export interface ScriptPaperUserData extends ScriptPaperUserListData {}
