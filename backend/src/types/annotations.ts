import { DiscardableData, isDiscardableData } from "./entities";
import { PageListData, isPageListData } from "./pages";
import { PaperUserListData, isPaperUserListData } from "./paperUsers";

export interface AnnotationPostData {}

export interface AnnotationListData extends DiscardableData {
  pageId: number;
  paperUserId: number;
}

export interface AnnotationData extends AnnotationListData {
  page: PageListData;
  paperUser: PaperUserListData;
}

export function isAnnotationListData(data: any): data is AnnotationListData {
  return (
    typeof data.pageId === "number" &&
    typeof data.paperUserId === "number" &&
    isDiscardableData(data)
  );
}

export function isAnnotationData(data: any): data is AnnotationData {
  return (
    isPageListData(data.page) &&
    isPaperUserListData(data.paperUser) &&
    isAnnotationListData(data)
  );
}
