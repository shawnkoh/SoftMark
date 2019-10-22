import { BaseData } from "./entities";

export interface AllocationPostData extends BaseData {
  questionTemplateId: number;
  paperUserId: number;
  totalAllocated: number;
}

export interface AllocationListData extends BaseData {
  questionTemplateId: number;
  paperUserId: number;
  totalAllocated: number;
}
