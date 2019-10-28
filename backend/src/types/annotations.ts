import { BaseData, isBaseData } from "./entities";
import { PageListData, isPageListData } from "./pages";
import { PaperUserListData, isPaperUserListData } from "./paperUsers";

export interface AnnotationPostData {
  layer: string;
}

export interface AnnotationListData extends BaseData {
  pageId: number;
  paperUserId: number;
  layer: string; // TODO: intentionally nested for now - not sure if it should be
}

export interface AnnotationData extends AnnotationListData {
  page: PageListData;
  paperUser: PaperUserListData;
}

export function isValidLayer(layer: string) {
  if (typeof layer !== "string") {
    return false;
  }
  try {
    JSON.parse(layer);
  } catch (error) {
    return false;
  }
  return true;
}

export function isAnnotationPostData(data: any): data is AnnotationPostData {
  return isValidLayer(data.layer);
}

export function isAnnotationListData(data: any): data is AnnotationListData {
  return (
    typeof data.pageId === "number" &&
    typeof data.paperUserId === "number" &&
    isValidLayer(data.layer) &&
    isBaseData(data)
  );
}

export function isAnnotationData(data: any): data is AnnotationData {
  return (
    isPageListData(data.page) &&
    isPaperUserListData(data.paperUser) &&
    isAnnotationListData(data)
  );
}
