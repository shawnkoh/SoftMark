import { AxiosResponse } from "axios";

import client from "./client";
import { createPaperUser } from "./papers";
import { PaperUserPostData, PaperUserRole } from "../types/paperUsers";

const URL = "/paper_users";

export async function postStudents(
  paperId: number,
  file: File,
  onSuccessfulResponse?: () => void
) {
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
            return createPaperUser(paperId, paperUserPostData);
          }
        }
      })
    );

    for (let i = 0; i < rows.length; i++) {
      var row = rows[i];
    }
  };
  reader.readAsText(file);
}
