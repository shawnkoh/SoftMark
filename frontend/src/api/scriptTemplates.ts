import BaseAPI from "./base";
import { AxiosResponse } from "axios";
import PDFJS from "pdfjs-dist/webpack";
import { sha256 } from "js-sha256";
import {
  ScriptTemplateData,
  ScriptTemplatePostData
} from "backend/src/types/scriptTemplates";
import { getPage } from "../utils/canvas";

class ScriptTemplatesAPI extends BaseAPI {
  private createScriptTemplate(
    id: number,
    scriptTemplatePostData: ScriptTemplatePostData
  ): Promise<AxiosResponse<{ scriptTemplate: ScriptTemplateData }>> {
    return this.getClient().post(
      `/papers/${id}/script_templates`,
      scriptTemplatePostData
    );
  }

  getScriptTemplate(
    id: number
  ): Promise<AxiosResponse<{ scriptTemplate: ScriptTemplateData }>> {
    return this.getClient().get(`/papers/${id}/script_templates/active`);
  }

  discardScript(id: number): Promise<AxiosResponse> {
    return this.getClient().delete(`${this.getUrl()}/${id}`);
  }

  undiscardScript(
    id: number
  ): Promise<AxiosResponse<{ scriptTemplate: ScriptTemplateData }>> {
    return this.getClient().patch(`${this.getUrl()}/${id}/undiscard`);
  }

  private getUrl() {
    return "/script_templates";
  }

  postScriptTemplate = async (
    paper_id: number,
    file: any,
    onSuccessfulResponse?: () => void,
    callbackScriptData?: React.Dispatch<ScriptTemplateData>
  ) => {
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
        this.createScriptTemplate(paper_id, scriptTemplatePostData).then(
          res => {
            if (onSuccessfulResponse) {
              onSuccessfulResponse();
            }
            if (callbackScriptData) {
              callbackScriptData(res.data.scriptTemplate);
            }
          }
        );
      });
    };
    reader.readAsDataURL(file);
  };
}

export default ScriptTemplatesAPI;
