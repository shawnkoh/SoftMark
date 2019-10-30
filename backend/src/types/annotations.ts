import { BaseData, isBaseData } from "./entities";
import { PageListData, isPageListData } from "./pages";
import { PaperUserListData, isPaperUserListData } from "./paperUsers";

export interface AnnotationLine {
  points: number[];
  type: "source-over" | "destination-out";
  color: string;
  width: number;
}

export type Annotation = AnnotationLine[];

export interface AnnotationPostData {
  layer: AnnotationLine[];
}

export interface AnnotationPatchData {
  layer: AnnotationLine[];
}

export interface AnnotationListData extends BaseData {
  pageId: number;
  paperUserId: number;
  layer: AnnotationLine[];
}

export interface AnnotationData extends AnnotationListData {
  page: PageListData;
  paperUser: PaperUserListData;
}

export function isValidLayer(layer: AnnotationLine[]) {
  return true; // Not sure how to test this
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
