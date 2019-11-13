import { AxiosResponse } from "axios";
import {
  AllocationListData,
  AllocationData,
  AllocationPostData
} from "backend/src/types/allocations";

import client from "./client";

const URL = "/allocations";

export async function getAllocationsOfPaper(
  paperId: number
): Promise<AxiosResponse<{ allocations: AllocationListData[] }>> {
  return client.get(`/papers/${paperId}/allocations`);
}

export async function getRootAllocationsOfPaper(
  paperId: number
): Promise<AxiosResponse<{ allocations: AllocationData[] }>> {
  return client.get(`/papers/${paperId}/root_allocations`);
}

export async function getAllocationsOfMarker(
  paperUserId: number
): Promise<AxiosResponse<{ allocations: AllocationListData[] }>> {
  return client.get(`/paper_users/${paperUserId}/allocations`);
}

export async function createAllocation(
  questionTemplateId: number,
  allocationPostData: AllocationPostData
): Promise<AxiosResponse<{ allocations: AllocationListData }>> {
  return client.post(
    `/question_templates/${questionTemplateId}/allocations`,
    allocationPostData
  );
}

export async function deleteAllocation(
  allocationId: number
): Promise<AxiosResponse> {
  return client.delete(`${URL}/${allocationId}`);
}
