import React, { useReducer, useCallback, useRef, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import produce from "immer";

import { CanvasMode } from "../../../types/canvas";
import { AnnotationLine, Annotation } from "backend/src/types/annotations";

import {
  getDistance,
  getClientPointerRelativeToStage,
  getRelativePointerPosition
} from "utils/canvas";

import UrlImage from "./UrlImage";

interface CanvasProps {
  width: number;
  height: number;
  backgroundImageSource: string;
  backgroundAnnotations: Annotation[];
  foregroundAnnotation: Annotation;
  mode: CanvasMode;
  penColor: string;
  penWidth: number;
  onForegroundAnnotationChange: (annotation: Annotation) => void;
}

enum CanvasActionType {
  ReplaceForegroundAnnotation = "replaceForegroundAnnotation",
  BeginLine = "beginLine",
  ContinueLine = "continueLine",
  EndLine = "endLine",
  Drag = "drag",
  ClickLine = "clickLine",
  PanZoom = "panZoom",
  SetDraggable = "setDraggable"
}

interface Point {
  x: number;
  y: number;
}

type CanvasAction =
  | { type: CanvasActionType.ReplaceForegroundAnnotation; payload: Annotation }
  | { type: CanvasActionType.BeginLine }
  | { type: CanvasActionType.ContinueLine; payload: Point }
  | { type: CanvasActionType.EndLine }
  | { type: CanvasActionType.ClickLine; payload: number }
  | { type: CanvasActionType.Drag; payload: Point }
  | {
      type: CanvasActionType.PanZoom;
      payload: { stageScale: number; stagePosition: Point; lastDist: number };
    }
  | { type: CanvasActionType.SetDraggable; payload: boolean };

interface CanvasState {
  lines: AnnotationLine[];
  isDrawing: boolean;
  stageScale: number;
  stagePosition: Point;
  lastDist: number;
  draggable: boolean;
}

const createCanvasStateReducer = ({
  penColor,
  penWidth,
  onForegroundAnnotationChange
}: Pick<
  CanvasProps,
  "penColor" | "penWidth" | "onForegroundAnnotationChange"
>) => (state: CanvasState, action: CanvasAction): CanvasState => {
  let nextState = state;
  let hasForegroundAnnotationChanged = false;
  switch (action.type) {
    case CanvasActionType.ReplaceForegroundAnnotation:
      nextState = produce(state, draftState => {
        draftState.lines = action.payload;
      });
      hasForegroundAnnotationChanged = true;
      break;
    case CanvasActionType.BeginLine:
      nextState = produce(state, draftState => {
        draftState.isDrawing = true;
        draftState.lines.push({
          points: [],
          type: "source-over",
          color: penColor,
          width: penWidth
        });
      });
      break;
    case CanvasActionType.ContinueLine:
      if (state.isDrawing) {
        nextState = produce(state, draftState => {
          draftState.lines[draftState.lines.length - 1].points.push(
            action.payload.x,
            action.payload.y
          );
        });
      }
      break;
    case CanvasActionType.EndLine:
      if (state.isDrawing) {
        hasForegroundAnnotationChanged = true;
      }
      nextState = produce(state, draftState => {
        draftState.isDrawing = false;
      });
      break;
    case CanvasActionType.ClickLine:
      nextState = produce(state, draftState => {
        draftState.lines.splice(action.payload, 1);
      });
      hasForegroundAnnotationChanged = true;
      break;
    case CanvasActionType.Drag:
      nextState = produce(state, draftState => {
        draftState.stagePosition = action.payload;
      });
      break;
    case CanvasActionType.PanZoom:
      nextState = produce(state, draftState => {
        draftState.stageScale = action.payload.stageScale;
        draftState.stagePosition = action.payload.stagePosition;
        draftState.lastDist = action.payload.lastDist;
      });
      break;
    case CanvasActionType.SetDraggable:
      nextState = {
        ...state,
        draggable: action.payload
      };
      break;
    default:
      nextState = state;
  }
  if (hasForegroundAnnotationChanged) {
    onForegroundAnnotationChange(nextState.lines);
  }
  return nextState;
};

const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  backgroundImageSource,
  backgroundAnnotations = [[]],
  foregroundAnnotation = [],
  mode = CanvasMode.View,
  penColor = "#ff0000",
  penWidth = 5,
  onForegroundAnnotationChange = console.log
}: CanvasProps) => {
  const initialCanvasState = {
    lines: foregroundAnnotation,
    isDrawing: false,
    stageScale: 1,
    stagePosition: { x: 0, y: 0 },
    lastDist: 0,
    draggable: false
  };

  const memoizedCanvasStateReducer = useCallback(
    createCanvasStateReducer({
      penColor,
      penWidth,
      onForegroundAnnotationChange
    }),
    [penColor, penWidth, onForegroundAnnotationChange]
  );

  const [canvasState, dispatch] = useReducer(
    memoizedCanvasStateReducer,
    initialCanvasState
  );

  useEffect(() => {
    if (foregroundAnnotation !== canvasState.lines) {
      dispatch({
        type: CanvasActionType.ReplaceForegroundAnnotation,
        payload: foregroundAnnotation
      });
    }
  }, [foregroundAnnotation]); // Ignore warning - do not change dependency array!

  const stageRef = useRef<any>(null);

  const handleMouseDown = event => {
    if ((mode as CanvasMode) === CanvasMode.Pen) {
      dispatch({ type: CanvasActionType.BeginLine });
    } else if ((mode as CanvasMode) === CanvasMode.View) {
      dispatch({
        type: CanvasActionType.SetDraggable,
        payload: true
      });
    }
  };

  const handleMouseMove = event => {
    if ((mode as CanvasMode) === CanvasMode.Pen) {
      const currentStageRef = stageRef.current;
      if (currentStageRef) {
        const stage = currentStageRef.getStage();
        const point = getRelativePointerPosition(stage);
        dispatch({ type: CanvasActionType.ContinueLine, payload: point });
      }
    } else if ((mode as CanvasMode) === CanvasMode.View) {
      dispatch({
        type: CanvasActionType.SetDraggable,
        payload: true
      });
    }
  };

  const handleMouseUp = event => {
    if ((mode as CanvasMode) === CanvasMode.Pen) {
      dispatch({ type: CanvasActionType.EndLine });
    } else if ((mode as CanvasMode) === CanvasMode.View) {
      dispatch({
        type: CanvasActionType.SetDraggable,
        payload: true
      });
    }
  };

  const handleMouseWheel = event => {
    event.evt.preventDefault();
    const currentStageRef = stageRef.current;
    if (currentStageRef) {
      if ((mode as CanvasMode) === CanvasMode.View) {
        const stage: any = currentStageRef.getStage();

        // adapted from Inspoboard code courtesy of Jian Jie @liaujianjie
        if (event.evt.ctrlKey) {
          const oldScale = stage.scaleX();

          const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
          };

          const unboundedNewScale = oldScale - event.evt.deltaY * 0.01;
          let newScale = unboundedNewScale;
          if (unboundedNewScale < 0.1) {
            newScale = 0.1;
          } else if (unboundedNewScale > 10.0) {
            newScale = 10.0;
          }

          const newPosition = {
            x:
              -(mousePointTo.x - stage.getPointerPosition().x / newScale) *
              newScale,
            y:
              -(mousePointTo.y - stage.getPointerPosition().y / newScale) *
              newScale
          };

          dispatch({
            type: CanvasActionType.PanZoom,
            payload: {
              stageScale: newScale,
              stagePosition: newPosition,
              lastDist: canvasState.lastDist
            }
          });
        } else {
          const dragDistanceScale = 0.75;
          const newPosition = {
            x:
              canvasState.stagePosition.x -
              dragDistanceScale * event.evt.deltaX,
            y:
              canvasState.stagePosition.y - dragDistanceScale * event.evt.deltaY
          };

          dispatch({
            type: CanvasActionType.PanZoom,
            payload: {
              stageScale: canvasState.stageScale,
              stagePosition: newPosition,
              lastDist: canvasState.lastDist
            }
          });
        }
      }
    }
  };

  const handleTouchStart = event => {
    if ((mode as CanvasMode) === CanvasMode.Pen) {
      dispatch({ type: CanvasActionType.BeginLine });
    } else if ((mode as CanvasMode) === CanvasMode.View) {
      dispatch({
        type: CanvasActionType.SetDraggable,
        payload: true
      });
    }
  };

  const handleTouchMove = event => {
    const currentStageRef = stageRef.current;
    if (currentStageRef) {
      const stage = currentStageRef.getStage();
      const touch1 = event.evt.touches[0];
      const touch2 = event.evt.touches[1];

      if (touch1 && touch2) {
        if ((mode as CanvasMode) === CanvasMode.View) {
          dispatch({ type: CanvasActionType.SetDraggable, payload: false });

          const dist = getDistance(
            {
              x: touch1.clientX,
              y: touch1.clientY
            },
            {
              x: touch2.clientX,
              y: touch2.clientY
            }
          );

          if (!canvasState.lastDist) {
            dispatch({
              type: CanvasActionType.PanZoom,
              payload: {
                stageScale: canvasState.stageScale,
                stagePosition: canvasState.stagePosition,
                lastDist: dist
              }
            });
          }

          const px = (touch1.clientX + touch2.clientX) / 2;
          const py = (touch1.clientY + touch2.clientY) / 2;
          const pointer = getClientPointerRelativeToStage(px, py, stage);

          const oldScale = stage.scaleX();
          const startPos = {
            x: pointer.x / oldScale - stage.x() / oldScale,
            y: pointer.y / oldScale - stage.y() / oldScale
          };

          const newScale =
            (oldScale * dist) /
            (canvasState.lastDist ? canvasState.lastDist : dist);
          const newPosition = {
            x: (pointer.x / newScale - startPos.x) * newScale,
            y: (pointer.y / newScale - startPos.y) * newScale
          };

          dispatch({
            type: CanvasActionType.PanZoom,
            payload: {
              stageScale: newScale,
              stagePosition: newPosition,
              lastDist: dist
            }
          });
        }
      } else {
        if ((mode as CanvasMode) === CanvasMode.Pen) {
          const point = getRelativePointerPosition(stage);
          dispatch({ type: CanvasActionType.ContinueLine, payload: point });
        } else if ((mode as CanvasMode) === CanvasMode.View) {
          dispatch({ type: CanvasActionType.SetDraggable, payload: true });
        }
      }
    }
  };

  const handleTouchEnd = event => {
    if ((mode as CanvasMode) === CanvasMode.Pen) {
      dispatch({ type: CanvasActionType.EndLine });
    } else if ((mode as CanvasMode) === CanvasMode.View) {
      dispatch({
        type: CanvasActionType.PanZoom,
        payload: {
          stageScale: canvasState.stageScale,
          stagePosition: canvasState.stagePosition,
          lastDist: 0
        }
      });
      dispatch({
        type: CanvasActionType.SetDraggable,
        payload: true
      });
    }
  };

  const handleDrag = event => {
    dispatch({
      type: CanvasActionType.Drag,
      payload: { x: event.target.x(), y: event.target.y() }
    });
  };

  const handleLineClick = index => {
    if (mode === CanvasMode.Eraser) {
      dispatch({ type: CanvasActionType.ClickLine, payload: index });
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={canvasState.stageScale}
      scaleY={canvasState.stageScale}
      x={canvasState.stagePosition.x}
      y={canvasState.stagePosition.y}
      draggable={
        (mode as CanvasMode) === CanvasMode.View && canvasState.draggable
      }
      onContentMousedown={handleMouseDown}
      onContentMousemove={handleMouseMove}
      onContentMouseup={handleMouseUp}
      onContentMouseout={handleMouseUp}
      onContentWheel={handleMouseWheel}
      onContentTouchstart={handleTouchStart}
      onContentTouchmove={handleTouchMove}
      onContentTouchend={handleTouchEnd}
      onDragMove={handleDrag}
      onDragEnd={handleDrag}
      style={{ touchAction: "none" }}
    >
      <Layer>
        <UrlImage src={backgroundImageSource} />
      </Layer>
      {backgroundAnnotations.map((backgroundAnnotationLines, i) => (
        <Layer key={i}>
          {backgroundAnnotationLines.map((line, j) => (
            <Line
              key={j}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.width}
              globalCompositeOperation={line.type}
              lineJoin="round"
              lineCap="round"
            />
          ))}
        </Layer>
      ))}
      <Layer>
        {canvasState.lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke={line.color}
            strokeWidth={line.width}
            globalCompositeOperation={line.type}
            lineJoin="round"
            lineCap="round"
            onClick={() => handleLineClick(i)}
            onTap={() => handleLineClick(i)}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Canvas;
