import { AxiosResponse } from "axios";
import {
  ScriptListData,
  ScriptData,
  ScriptPostData,
  ScriptPatchData
} from "backend/src/types/scripts";
import { ScriptViewData } from "backend/src/types/view";
import PDFJS from "pdfjs-dist/webpack";
import { sha256 } from "js-sha256";

import client from "./client";
import { getPage } from "../utils/canvas";

const URL = "/scripts";

export async function createScript(
  id: number,
  scriptPostData: ScriptPostData
): Promise<AxiosResponse<{ script: ScriptData }>> {
  return client.post(`/papers/${id}/scripts`, scriptPostData, {
    timeout: 120000
  });
}
export async function matchScriptsToPaperUsers(
  id: number
): Promise<AxiosResponse<{ scripts: ScriptListData[] }>> {
  return client.patch(`/papers/${id}/scripts/match`);
}

export async function getScript(id: number): Promise<ScriptData | null> {
  try {
    const response = await client.get<{ script: ScriptData }>(`${URL}/${id}`);
    return response.data.script;
  } catch (error) {
    return null;
  }
}

export async function viewScript(id: number): Promise<ScriptViewData | null> {
  try {
    const { data } = await client.get<ScriptViewData>(`${URL}/${id}/view`);
    return data;
  } catch (error) {
    return null;
  }
}

export async function getScripts(
  id: number
): Promise<AxiosResponse<{ scripts: ScriptListData[] }>> {
  return client.get(`/papers/${id}/scripts`);
}

export async function patchScript(
  id: number,
  scriptPatchData: ScriptPatchData
): Promise<AxiosResponse<{ script: ScriptData }>> {
  return client.patch(`${URL}/${id}`, scriptPatchData);
}

export async function discardScript(id: number): Promise<AxiosResponse> {
  return client.delete(`${URL}/${id}`);
}

export async function discardScripts(paperId: number): Promise<AxiosResponse> {
  return client.delete(`/papers/${paperId}/all_scripts`);
}

export async function undiscardScript(
  id: number
): Promise<AxiosResponse<{ script: ScriptData }>> {
  return client.patch(`${URL}/${id}/undiscard`);
}

export async function postScript(
  paper_id: number,
  filename: string,
  file: File,
  onSuccess: () => void,
  onFail: () => void,
  atLoadEnd: () => void
) {
  const reader = new FileReader();
  reader.onloadend = () => {
    const pdfAsString = String(reader.result);
    PDFJS.getDocument(pdfAsString).promise.then(async pdf => {
      const pages: any = [];
      for (let i = 0; i < pdf.numPages; i++) {
        pages.push(getPage(i + 1, pdf));
      }
      const scriptPostData: ScriptPostData = {
        filename,
        sha256: sha256(pdfAsString),
        imageUrls: await Promise.all(pages)
      };
      createScript(paper_id, scriptPostData)
        .then(res => {
          onSuccess();
        })
        .catch(() => onFail())
        .finally(atLoadEnd);
    });
  };
  await reader.readAsDataURL(file);
}
