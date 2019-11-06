import BaseAPI from "./base";
import { AxiosResponse } from "axios";
import {
  PaperUserListData,
  PaperUserData,
  PaperUserPostData,
  PaperUserRole
} from "../types/paperUsers";

class PaperUsersAPI extends BaseAPI {
  createPaperUser(
    id: number,
    paperUserPostData: PaperUserPostData
  ): Promise<AxiosResponse<PaperUserData>> {
    return this.getClient().post(`papers/${id}/users`, paperUserPostData);
  }

  private getUrl() {
    return "/paper_users";
  }

  postStudents = async (
    paperId: number,
    file: File,
    onSuccessfulResponse?: () => void
  ) => {
    const reader = new FileReader();
    reader.onloadend = (e: any) => {
      const rows: string[] = e.target.result.split("\n");
      Promise.all(
        rows.map(row => {
          if (row) {
            var cells = row.split(",");
            if (cells.length >= 3) {
              const paperUserPostData: PaperUserPostData = {
                matriculationNumber: cells[0],
                name: cells[1],
                email: cells[2],
                role: PaperUserRole.Student
              };
              console.log(paperUserPostData);
              return this.createPaperUser(paperId, paperUserPostData);
            }
          }
        })
      );

      for (let i = 0; i < rows.length; i++) {
        var row = rows[i];
      }
    };
    reader.readAsText(file);
  };
}

export default PaperUsersAPI;
