import { AnnotationListData, isAnnotationListData } from "./annotations";
import { DiscardableData, isDiscardableData } from "./entities";

export interface PageListData extends DiscardableData {
  pageNo: number;
  imageUrl: string;
}

export interface PageData extends PageListData {
  annotations: AnnotationListData[];
}

export function isPageListData(data: any): data is PageListData {
  return (
    typeof data.pageNo === "number" &&
    typeof data.imageUrl === "string" &&
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
