import { Annotation } from "backend/src/types/annotations";

export enum CanvasMode {
  Pen = "pen",
  Eraser = "eraser",
  View = "view"
}

export interface CanvasProps {
  width: number;
  height: number;
  backgroundImageSource: string;
  backgroundAnnotations: Annotation[];
  foregroundAnnotation: Annotation;
  mode: CanvasMode;
  penColor: string;
  penWidth: number;
  resetView: boolean;
  onForegroundAnnotationChange: (annotation: Annotation) => void;
}
