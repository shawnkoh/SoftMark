import BaseAPI from "./base";
import { AxiosResponse } from "axios";
import {
  PaperUserListData,
  PaperUserData,
  PaperUserPostData
} from "../types/paperUsers";

class PaperUsersAPI extends BaseAPI {
  private getUrl() {
    return "/paper_users";
  }
}

export default PaperUsersAPI;
