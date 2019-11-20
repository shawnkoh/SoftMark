import { AnnotationListData, isAnnotationListData } from "./annotations";
import { DiscardableData, isDiscardableData } from "./entities";

export interface PageListData extends DiscardableData {
  scriptId: number;
  pageNo: number;
  annotationsCount: number;
  imageUrl: string;
}

export interface PageData extends PageListData {
  annotations: AnnotationListData[];
}

export function isPageListData(data: any): data is PageListData {
  return (
    typeof data.scriptId === "number" &&
    typeof data.annotationsCount === "number" &&
    isDiscardableData(data)
  );
}

export function isPageData(data: any): data is PageData {
  return (
    data.annotations.every((annotation: any) =>
      isAnnotationListData(annotation)
    ) && isPageListData(data)
  );
}
