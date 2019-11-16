import { DiscardableData, isDiscardableData } from "./entities";
import { PaperUserRole } from "./paperUsers";

export interface PaperPostData {
  name: string;
}

export type PaperPatchData = PaperPostData;

export interface PaperData extends DiscardableData {
  name: string;
  role: PaperUserRole;
}

export function isPaperData(data: any): data is PaperData {
  return (
    typeof data.name === "string" &&
    Object.values(PaperUserRole).includes(data.role) &&
    isDiscardableData(data)
  );
}
