import { Annotation } from "backend/src/types/annotations";

export interface Point {
  x: number;
  y: number;
}

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
  position: Point;
  scale: number;
  onForegroundAnnotationChange: (annotation: Annotation) => void;
  onViewChange: (position: Point, scale: number) => void;
}

export interface CanvasSaveProps {
  width?: number;
  height?: number;
  backgroundImageSource: string;
  backgroundAnnotations?: Annotation[];
  foregroundAnnotation?: Annotation;
  mode?: CanvasMode;
  penColor?: string;
  penWidth?: number;
  position?: Point;
  scale?: number;
}
