import { AxiosResponse } from "axios";
import {
  AllocationListData,
  AllocationPostData
} from "backend/src/types/allocations";

import client from "./client";

const URL = "/allocations";

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
