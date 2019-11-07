import { AxiosResponse } from "axios";
import PDFJS from "pdfjs-dist/webpack";
import { sha256 } from "js-sha256";
import {
  ScriptTemplateData,
  ScriptTemplatePostData
} from "backend/src/types/scriptTemplates";

import client from "./client";
import { getPage } from "../utils/canvas";

const URL = "/script_templates";

export async function createScriptTemplate(
  id: number,
  scriptTemplatePostData: ScriptTemplatePostData
): Promise<AxiosResponse<{ scriptTemplate: ScriptTemplateData }>> {
  return client.post(`/papers/${id}/script_templates`, scriptTemplatePostData);
}

export async function getScriptTemplate(
  paperId: number
): Promise<ScriptTemplateData | null> {
  try {
    const response = await client.get(
      `/papers/${paperId}/script_templates/active`
    );
    return response.data.scriptTemplate;
  } catch (error) {
    return null;
  }
}

export async function discardScriptTemplate(
  id: number
): Promise<AxiosResponse> {
  return client.delete(`${URL}/${id}`);
}

export async function undiscardScriptTemplate(
  id: number
): Promise<AxiosResponse<{ scriptTemplate: ScriptTemplateData }>> {
  return client.patch(`${URL}/${id}/undiscard`);
}

export async function postScriptTemplate(
  paper_id: number,
  file: File,
  onSuccess: () => void,
  onFail: () => void,
  callbackScriptData?: React.Dispatch<ScriptTemplateData>
) {
  const reader = new FileReader();
  reader.onloadend = () => {
    const pdfAsString = String(reader.result);
    PDFJS.getDocument(pdfAsString).promise.then(async pdf => {
      const pages: any = [];
      for (let i = 0; i < pdf.numPages; i++) {
        pages.push(getPage(i + 1, pdf));
      }
      const scriptTemplatePostData: ScriptTemplatePostData = {
        imageUrls: await Promise.all(pages),
        sha256: sha256(pdfAsString)
      };
      createScriptTemplate(paper_id, scriptTemplatePostData)
        .then(res => {
          onSuccess();
          if (callbackScriptData) {
            callbackScriptData(res.data.scriptTemplate);
          }
        })
        .catch(() => onFail());
    });
  };
  reader.readAsDataURL(file);
}
