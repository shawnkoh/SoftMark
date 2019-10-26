import { BaseData, isBaseData } from "./entities";

export interface AllocationPostData {
  questionTemplateId: number;
  paperUserId: number;
  totalAllocated: number;
}

export interface AllocationListData extends BaseData {
  questionTemplateId: number;
  paperUserId: number;
}

export interface AllocationData extends AllocationListData {}

export function isAllocationListData(data: any): data is AllocationListData {
  return (
    typeof data.questionTemplateId === "number" &&
    typeof data.paperUserId === "number" &&
    isBaseData(data)
  );
}

export function isAllocationData(data: any): data is AllocationData {
  return isAllocationListData(data);
}
