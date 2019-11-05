import { AxiosResponse } from "axios";
import {
  PaperListData,
  PaperData,
  PaperPatchData,
  PaperPostData
} from "backend/src/types/papers";

import client from "./client";
import { PaperUserData, PaperUserPostData } from "../types/paperUsers";

const URL = "/papers";

export async function createPaper(
  paperPostData: PaperPostData
): Promise<AxiosResponse<{ paper: PaperData }>> {
  return client.post(`${URL}`, paperPostData);
}

export async function getPapers(): Promise<
  AxiosResponse<{ paper: PaperListData[] }>
> {
  return client.get(`${URL}`);
}

export async function getPaper(
  id: number
): Promise<{ paper: PaperData; currentPaperUser: PaperUserData } | null> {
  try {
    const response = await client.get(`${URL}/${id}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

export async function editPaper(
  id: number,
  paperPatchData: PaperPatchData
): Promise<AxiosResponse<{ paper: PaperData }>> {
  return client.patch(`${URL}/${id}`, paperPatchData);
}

export async function createPaperUser(
  id: number,
  paperUserPostData: PaperUserPostData
): Promise<AxiosResponse<PaperUserData>> {
  return client.post(`${URL}/${id}/users`, paperUserPostData);
}
