import BaseAPI from "./base";
import { AxiosResponse } from "axios";
import {
  PaperUserListData,
  PaperUserData,
  PaperUserPostData
} from "backend/src/types/paperUsers";

class PaperUsersAPI extends BaseAPI {
  private getUrl() {
    return "/paper_users";
  }
}

export default PaperUsersAPI;
