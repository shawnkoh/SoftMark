import { DiscardableData } from "./entities";
import { PageListData } from "./pages";
import { PaperUserListData } from "./paperUsers";

export interface AnnotationPostData {}

export interface AnnotationListData extends DiscardableData {
  pageId: number;
  paperUserId: number;
}

export interface AnnotationData extends AnnotationListData {
  page: PageListData;
  paperUser: PaperUserListData;
}
