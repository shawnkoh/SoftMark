import {
  PaperUserRole,
  PaperUserListData,
  isPaperUserListData
} from "./paperUsers";
import { DiscardableData, isDiscardableData } from "./entities";

export interface PaperPostData {
  name: string;
}

export type PaperPatchData = PaperPostData;

export interface PaperListData extends DiscardableData {
  name: string;
  role: PaperUserRole;
}

export interface PaperData extends PaperListData {
  paperUsers: PaperUserListData[];
}

export function isPaperListData(data: any): data is PaperListData {
  return (
    typeof data.name === "string" &&
    Object.values(PaperUserRole).includes(data.role) &&
    isDiscardableData(data)
  );
}

export function isPaperData(data: any): data is PaperData {
  return (
    data.paperUsers.every((paperUser: any) => isPaperUserListData(paperUser)) &&
    isPaperListData(data)
  );
}
