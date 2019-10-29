export interface AnnotationLine {
  points: number[];
  type: "source-over" | "destination-out";
  color: string;
  width: number;
}

export type Annotation = AnnotationLine[];

export enum CanvasMode {
  Pen = "pen",
  Eraser = "eraser",
  View = "view"
}
