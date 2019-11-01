import BaseAPI from "./base";
import { AxiosResponse } from "axios";
import {
  PaperListData,
  PaperData,
  PaperPatchData,
  PaperPostData
} from "backend/src/types/papers";
import {
  PaperUserListData,
  PaperUserData,
  PaperUserPostData
} from "../types/paperUsers";

class PapersAPI extends BaseAPI {
  createPaper(
    paperPostData: PaperPostData
  ): Promise<AxiosResponse<{ paper: PaperData }>> {
    return this.getClient().post(`${this.getUrl()}`, paperPostData);
  }

  editPaper(
    id: number,
    paperPatchData: PaperPatchData
  ): Promise<AxiosResponse<{ paper: PaperData }>> {
    return this.getClient().patch(`${this.getUrl()}/${id}`, paperPatchData);
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

  getPapers(): Promise<AxiosResponse<{ paper: PaperListData[] }>> {
    return this.getClient().get(`${this.getUrl()}`);
  }

  getPaper(id: number): Promise<AxiosResponse<{ paper: PaperData }>> {
    return this.getClient().get(`${this.getUrl()}/${id}`);
  }

  private getUrl() {
    return "/papers";
  }
}

export default PapersAPI;
