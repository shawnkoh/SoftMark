import BaseAPI from "./base";
import { AxiosResponse } from "axios";
import PDFJS from "pdfjs-dist/webpack";
import {
  ScriptListData,
  ScriptData,
  ScriptPostData
} from "backend/src/types/scripts";
import { getPage } from "../utils/canvas";

class ScriptsAPI extends BaseAPI {
  private createScript(
    id: number,
    scriptPostData: ScriptPostData
  ): Promise<AxiosResponse<{ script: ScriptData }>> {
    return this.getClient().post(`/papers/${id}/scripts`, scriptPostData);
  }

  getScripts(id: number): Promise<AxiosResponse<{ script: ScriptListData[] }>> {
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
    email: string,
    file: any,
    callbackScriptData?: React.Dispatch<any>
  ) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      PDFJS.getDocument(String(reader.result)).promise.then(async pdf => {
        const pages: any = [];
        for (let i = 0; i < pdf.numPages; i++) {
          pages.push(getPage(i + 1, pdf));
        }
        const scriptPostData: ScriptPostData = {
          email,
          imageUrls: await Promise.all(pages)
        };
        this.createScript(paper_id, scriptPostData).then(res => {
          if (callbackScriptData) {
            callbackScriptData(res.data);
          }
        });
      });
    };
    reader.readAsDataURL(file);
  };
}

export default ScriptsAPI;
