import { PaperUserRole, PaperUserListData } from "./paperUsers";
import { DiscardableData } from "./entities";

export interface PaperPostData {
  name: string;
}

export interface PaperListData extends DiscardableData {
  name: string;
  role: PaperUserRole;
}

export interface PaperData extends PaperListData {
  paperUsers: PaperUserListData[];
}