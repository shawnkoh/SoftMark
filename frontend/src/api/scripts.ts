import { AxiosResponse } from "axios";
import {
  ScriptListData,
  ScriptData,
  ScriptPostData
} from "backend/src/types/scripts";
import PDFJS from "pdfjs-dist/webpack";
import { sha256 } from "js-sha256";

import BaseAPI from "./base";
import { getPage } from "../utils/canvas";

class ScriptsAPI extends BaseAPI {
  private createScript(
    id: number,
    scriptPostData: ScriptPostData
  ): Promise<AxiosResponse<{ script: ScriptData }>> {
    return this.getClient().post(`/papers/${id}/scripts`, scriptPostData);
  }

  getScripts(
    id: number
  ): Promise<AxiosResponse<{ scripts: ScriptListData[] }>> {
    return this.getClient().get(`/papers/${id}/scripts`);
  }

  getScript(id: number): Promise<AxiosResponse<{ script: ScriptData }>> {
    return this.getClient().get(`${this.getUrl()}/${id}`);
  }

  discardScript(id: number): Promise<AxiosResponse> {
    return this.getClient().delete(`${this.getUrl()}/${id}`);
  }

  undiscardScript(id: number): Promise<AxiosResponse<{ script: ScriptData }>> {
    return this.getClient().patch(`${this.getUrl()}/${id}/undiscard`);
  }

  private getUrl() {
    return "/scripts";
  }

  postScript = async (
    paper_id: number,
    filename: string,
    file: any,
    onSuccessfulResponse?: () => void,
    callbackScriptData?: React.Dispatch<ScriptData>
  ) => {
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
        this.createScript(paper_id, scriptPostData).then(res => {
          onSuccessfulResponse && onSuccessfulResponse();
          if (callbackScriptData) {
            callbackScriptData(res.data.script);
          }
        });
      });
    };
    reader.readAsDataURL(file);
  };
}

export default ScriptsAPI;
