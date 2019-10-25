import BaseAPI from "./base";
import { AxiosResponse } from "axios";
import {
  PaperListData,
  PaperData,
  PaperPostData
} from "backend/src/types/papers";
import { PaperUserData, PaperUserPostData } from "backend/src/types/paperUsers";

class PapersAPI extends BaseAPI {
  createPaper(paperPostData: PaperPostData): Promise<AxiosResponse<PaperData>> {
    return this.getClient().post(`${this.getUrl()}`, paperPostData);
  }

  createPaperUser(
    id: number,
    paperUserPostData: PaperUserPostData
  ): Promise<AxiosResponse<PaperUserData>> {
    return this.getClient().post(
      `${this.getUrl()}/${id}/users`,
      paperUserPostData
    );
  }

  getPapers(): Promise<AxiosResponse<PaperListData[]>> {
    return this.getClient().get(`${this.getUrl()}`);
  }

  getPaper(id: number): Promise<AxiosResponse<PaperData>> {
    return this.getClient().get(`${this.getUrl()}/${id}`);
  }

  private getUrl() {
    return "/papers";
  }
}

export default PapersAPI;
