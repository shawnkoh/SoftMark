import { AnnotationLine, AnnotationText } from "backend/src/types/annotations";

export interface Point {
  x: number;
  y: number;
}

export enum CanvasMode {
  Pen = "pen",
  Text = "text",
  Eraser = "eraser",
  View = "view"
}

export interface CanvasProps {
  width: number;
  height: number;
  backgroundImageSource: string;
  backgroundLinesArray: AnnotationLine[][];
  foregroundLines: AnnotationLine[];
  backgroundTextsArray: AnnotationText[][];
  foregroundTexts: AnnotationText[];
  mode: CanvasMode;
  penColor: string;
  penWidth: number;
  text: string;
  textColor: string;
  textSize: number;
  position: Point;
  scale: number;
  onForegroundLinesChange: (annotationLines: AnnotationLine[]) => void;
  onForegroundTextsChange: (annotationTexts: AnnotationText[]) => void;
  onViewChange: (position: Point, scale: number) => void;
}

export interface CanvasSaveProps {
  width?: number;
  height?: number;
  backgroundImageSource: string;
  backgroundAnnotations?: AnnotationLine[][];
  foregroundAnnotation?: AnnotationLine[];
  mode?: CanvasMode;
  penColor?: string;
  penWidth?: number;
  position?: Point;
  scale?: number;
}
