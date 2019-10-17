import { PaperUserRole } from "./paperUsers";
import { PaperUser } from "../entities/PaperUser";

export interface PaperListData {
  id: number;
  name: string;
  role: PaperUserRole;
  createdAt: Date;
  updatedAt: Date
  discardedAt?: Date;
}

export interface PaperData extends PaperListData {
  paperUsers: PaperUser[];
}