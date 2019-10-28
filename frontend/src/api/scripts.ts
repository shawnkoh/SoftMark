import BaseAPI from "./base";
import { AxiosResponse } from "axios";
import PDFJS from "pdfjs-dist/webpack";
import {
  ScriptListData,
  ScriptData,
  ScriptPostData
} from "backend/src/types/scripts";

class ScriptsAPI extends BaseAPI {
  private createScript(
    id: number,
    scriptPostData: ScriptPostData
  ): Promise<AxiosResponse<ScriptData>> {
    return this.getClient().post(`/papers/${id}/scripts`, scriptPostData);
  }

  getScripts(id: number): Promise<AxiosResponse<ScriptListData[]>> {
    return this.getClient().get(`/papers/${id}/scripts`);
  }

  getScript(id: number): Promise<AxiosResponse<ScriptData>> {
    return this.getClient().get(`${this.getUrl()}/${id}`);
  }

  discardScript(id: number): Promise<AxiosResponse> {
    return this.getClient().delete(`${this.getUrl()}/${id}`);
  }

  undiscardScript(id: number): Promise<AxiosResponse<ScriptData>> {
    return this.getClient().patch(`${this.getUrl()}/${id}/undiscard`);
  }

  private getUrl() {
    return "/scripts";
  }

  private getPage = (num: number, pdf) => {
    return new Promise((resolve, reject) => {
      pdf.getPage(num).then(page => {
        const scale = 1.5;
        const viewport = page.getViewport(scale);
        const canvas = document.createElement("canvas");
        const canvasContext = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page
          .render({
            canvasContext,
            viewport
          })
          .promise.then(() => {
            resolve(canvas.toDataURL("image/jpeg"));
          });
      });
    });
  };

  postScript = async (
    paper_id: number,
    email: string,
    file: any,
    callbackScriptData?: React.Dispatch<any>
  ) => {
    let res: any[] = [];
    return await fetch(file)
      .then(data => data.blob())
      .then(async blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          PDFJS.getDocument(String(reader.result)).promise.then(async pdf => {
            const pages: any = [];
            for (let i = 0; i < pdf.numPages; i++) {
              pages.push(this.getPage(i + 1, pdf));
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
      });
  };
}

export default ScriptsAPI;
