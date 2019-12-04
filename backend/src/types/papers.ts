import { DiscardableData, isDiscardableData, isValidDate } from "./entities";
import { PaperUserRole } from "./paperUsers";

export interface PaperPostData {
  name: string;
}

export type PaperPatchData = PaperPostData;

export interface PaperData extends DiscardableData {
  name: string;
  role: PaperUserRole;
  publishedDate: Date | null;
}

export function isPaperData(data: any): data is PaperData {
  return (
    typeof data.name === "string" &&
    Object.values(PaperUserRole).includes(data.role) &&
    isValidDate(data.publishedDate) &&
    isDiscardableData(data)
  );
}
