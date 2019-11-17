import { AxiosResponse } from "axios";
import {
  PaperData,
  PaperPatchData,
  PaperPostData
} from "backend/src/types/papers";
import { ScriptTemplateSetupData } from "backend/src/types/scriptTemplates";
import { PaperUserData, PaperUserPostData } from "../types/paperUsers";
import client from "./client";

const URL = "/papers";

export async function createPaper(
  paperPostData: PaperPostData
): Promise<AxiosResponse<{ paper: PaperData }>> {
  return client.post(`${URL}`, paperPostData);
}

export async function getPapers(): Promise<
  AxiosResponse<{ papers: PaperData[] }>
> {
  return client.get(`${URL}`);
}

export async function getPaper(
  id: number
): Promise<AxiosResponse<{ paper: PaperData }>> {
  return await client.get(`${URL}/${id}`);
}

export async function editPaper(
  id: number,
  paperPatchData: PaperPatchData
): Promise<AxiosResponse<{ paper: PaperData }>> {
  return client.patch(`${URL}/${id}`, paperPatchData);
}

export async function discardPaper(id: number): Promise<AxiosResponse> {
  return client.delete(`${URL}/${id}`);
}

export async function createPaperUser(
  id: number,
  paperUserPostData: PaperUserPostData
): Promise<AxiosResponse<PaperUserData>> {
  return client.post(`${URL}/${id}/users`, paperUserPostData);
}

export async function getScriptTemplateSetupData(paperId: number) {
  return await client.get<ScriptTemplateSetupData>(
    `${URL}/${paperId}/script_template/setup`
  );
}
