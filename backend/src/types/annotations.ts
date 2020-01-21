import { BaseData, isBaseData } from "./entities";

export interface AnnotationLine {
  points: number[];
  type: "source-over" | "destination-out";
  color: string;
  width: number;
}

export type Annotation = AnnotationLine[];

export interface AnnotationText {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

export interface AnnotationPostData {
  layer: AnnotationLine[];
}

export interface AnnotationPatchData {
  layer: AnnotationLine[];
}

export interface AnnotationData extends BaseData {
  pageId: number;
  paperUserId: number;
  layer: AnnotationLine[];
}

export function isValidLayer(layer: AnnotationLine[]) {
  return true; // Not sure how to test this
}

export function isAnnotationPostData(data: any): data is AnnotationPostData {
  return isValidLayer(data.layer);
}

export function isAnnotationData(data: any): data is AnnotationData {
  return (
    typeof data.pageId === "number" &&
    typeof data.paperUserId === "number" &&
    isValidLayer(data.layer) &&
    isBaseData(data)
  );
}
