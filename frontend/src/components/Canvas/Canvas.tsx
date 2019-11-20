import React, { useReducer, useCallback, useRef, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import produce from "immer";
import isEqual from "lodash/isEqual";

import { AnnotationLine, Annotation } from "backend/src/types/annotations";
import { Point, CanvasMode, CanvasProps } from "./types";
import {
  getDistance,
  getClientPointerRelativeToStage,
  getRelativePointerPosition
} from "./utils";

import UrlImage from "./UrlImage";

enum CanvasActionType {
  ReplaceForegroundAnnotation = "replaceForegroundAnnotation",
  BeginLine = "beginLine",
  ContinueLine = "continueLine",
  EndLine = "endLine",
  Drag = "drag",
  BeginErase = "beginErase",
  EndErase = "endErase",
  DeleteLine = "deleteLine",
  PanZoom = "panZoom",
  SetDraggable = "setDraggable"
}

type CanvasAction =
  | { type: CanvasActionType.ReplaceForegroundAnnotation; payload: Annotation }
  | { type: CanvasActionType.BeginLine }
  | { type: CanvasActionType.ContinueLine; payload: Point }
  | { type: CanvasActionType.EndLine }
  | { type: CanvasActionType.BeginErase }
  | { type: CanvasActionType.EndErase }
  | { type: CanvasActionType.DeleteLine; payload: number }
  | { type: CanvasActionType.Drag; payload: Point }
  | {
      type: CanvasActionType.PanZoom;
      payload: {
        stageScale: number;
        stagePosition: Point;
        lastTouchDistance: number;
        lastPointerPosition: Point | undefined;
      };
    }
  | { type: CanvasActionType.SetDraggable; payload: boolean };

interface CanvasState {
  lines: AnnotationLine[];
  isDrawing: boolean;
  lastTouchDistance: number;
  draggable: boolean;
  lastPointerPosition: Point | undefined;
}

const createCanvasStateReducer = ({
  penColor,
  penWidth,
  scale,
  onForegroundAnnotationChange,
  onViewChange
}: Pick<
  CanvasProps,
  | "penColor"
  | "penWidth"
  | "scale"
  | "onForegroundAnnotationChange"
  | "onViewChange"
>) => (state: CanvasState, action: CanvasAction): CanvasState => {
  let nextState = state;
  let hasForegroundAnnotationChanged = false;
  switch (action.type) {
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
    case CanvasActionType.PanZoom:
      nextState = produce(state, draftState => {
        draftState.lastTouchDistance = action.payload.lastTouchDistance;
        draftState.lastPointerPosition = action.payload.lastPointerPosition;
      });
      onViewChange(action.payload.stagePosition, action.payload.stageScale);
      break;
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
    case CanvasActionType.EndLine:
      if (state.isDrawing) {
        hasForegroundAnnotationChanged = true;
      }
      nextState = produce(state, draftState => {
        draftState.isDrawing = false;
      });
      break;
    case CanvasActionType.BeginErase:
      nextState = produce(state, draftState => {
        draftState.isDrawing = true;
      });
      break;
    case CanvasActionType.EndErase:
      nextState = produce(state, draftState => {
        draftState.isDrawing = false;
      });
      break;
    case CanvasActionType.DeleteLine:
      nextState = produce(state, draftState => {
        draftState.lines.splice(action.payload, 1);
      });
      hasForegroundAnnotationChanged = true;
      break;
    case CanvasActionType.Drag:
      onViewChange(action.payload, scale);
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
  backgroundAnnotations,
  foregroundAnnotation,
  mode,
  penColor,
  penWidth,
  position,
  scale,
  onForegroundAnnotationChange,
  onViewChange
}: CanvasProps) => {
  const initialCanvasState: CanvasState = {
    lines: foregroundAnnotation,
    isDrawing: false,
    draggable: false,
    lastTouchDistance: 0,
    lastPointerPosition: undefined
  };

  const memoizedCanvasStateReducer = useCallback(
    createCanvasStateReducer({
      penColor,
      penWidth,
      scale,
      onForegroundAnnotationChange,
      onViewChange
    }),
    [penColor, penWidth, onForegroundAnnotationChange, onViewChange]
  );

  const [canvasState, dispatch] = useReducer(
    memoizedCanvasStateReducer,
    initialCanvasState
  );

  useEffect(() => {
    if (!isEqual(foregroundAnnotation, canvasState.lines)) {
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
    } else if ((mode as CanvasMode) === CanvasMode.Eraser) {
      dispatch({ type: CanvasActionType.BeginErase });
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
    } else if ((mode as CanvasMode) === CanvasMode.Eraser) {
      dispatch({ type: CanvasActionType.EndErase });
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
      const stage: any = currentStageRef.getStage();

      // adapted from Inspoboard code courtesy of Jian Jie @liaujianjie

      if (event.evt.ctrlKey) {
        const oldScale = stage.scaleX();

        const mousePointTo = {
          x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
          y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
        };

        const newScale = oldScale - event.evt.deltaY * 0.01;
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
            lastTouchDistance: canvasState.lastTouchDistance,
            lastPointerPosition: undefined
          }
        });
      } else {
        const dragDistanceScale = 0.75;

        const newPosition = {
          x: position.x - dragDistanceScale * event.evt.deltaX,
          y: position.y - dragDistanceScale * event.evt.deltaY
        };

        dispatch({
          type: CanvasActionType.PanZoom,
          payload: {
            stageScale: scale,
            stagePosition: newPosition,
            lastTouchDistance: canvasState.lastTouchDistance,
            lastPointerPosition: undefined
          }
        });
      }
    }
  };

  ///////////////////////    Touch start    ////////////////////////////////
  const handleTouchStart = event => {
    if ((mode as CanvasMode) === CanvasMode.Pen) {
      dispatch({
        type: CanvasActionType.SetDraggable,
        payload: false
      });
      dispatch({ type: CanvasActionType.BeginLine });
    } else if ((mode as CanvasMode) === CanvasMode.Eraser) {
      dispatch({
        type: CanvasActionType.SetDraggable,
        payload: false
      });
      dispatch({ type: CanvasActionType.BeginErase });
    } else if ((mode as CanvasMode) === CanvasMode.View) {
      dispatch({
        type: CanvasActionType.SetDraggable,
        payload: true
      });
    }
  };

  ///////////////////////    Touch move    ////////////////////////////////
  const handleTouchMove = event => {
    const currentStageRef = stageRef.current;
    if (currentStageRef) {
      const stage = currentStageRef.getStage();

      const touches = event.evt.touches;

      if (touches.length > 1) {
        const touch1 = touches[0];
        const touch2 = touches[1];

        dispatch({
          type: CanvasActionType.SetDraggable,
          payload: false
        });

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

        const currX = (touch1.clientX + touch2.clientX) / 2;
        const currY = (touch1.clientY + touch2.clientY) / 2;
        const currPointerPosition = { x: currX, y: currY };
        const pointer = getClientPointerRelativeToStage(currX, currY, stage);

        if (!canvasState.lastTouchDistance) {
          dispatch({
            type: CanvasActionType.PanZoom,
            payload: {
              stageScale: scale,
              stagePosition: position,
              lastPointerPosition: canvasState.lastPointerPosition,
              lastTouchDistance: dist
            }
          });
        }
        if (!canvasState.lastPointerPosition) {
          dispatch({
            type: CanvasActionType.PanZoom,
            payload: {
              stageScale: scale,
              stagePosition: position,
              lastPointerPosition: currPointerPosition,
              lastTouchDistance: canvasState.lastTouchDistance
            }
          });
        }

        const lastPointerPosition = canvasState.lastPointerPosition;
        const prevX = lastPointerPosition
          ? lastPointerPosition.x
          : currPointerPosition.x;
        const prevY = lastPointerPosition
          ? lastPointerPosition.y
          : currPointerPosition.y;
        const deltaX = currX - prevX;
        const deltaY = currY - prevY;

        const oldScale = stage.scaleX();
        const startPos = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale
        };

        const newScale =
          (oldScale * dist) /
          (canvasState.lastTouchDistance
            ? canvasState.lastTouchDistance
            : dist);
        const newPosition = {
          x: ((pointer.x + deltaX) / newScale - startPos.x) * newScale,
          y: ((pointer.y + deltaY) / newScale - startPos.y) * newScale
        };

        dispatch({
          type: CanvasActionType.PanZoom,
          payload: {
            stageScale: newScale,
            stagePosition: newPosition,
            lastTouchDistance: dist,
            lastPointerPosition: currPointerPosition
          }
        });
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

  ///////////////////////    Touch end    ////////////////////////////////
  const handleTouchEnd = event => {
    dispatch({
      type: CanvasActionType.PanZoom,
      payload: {
        stageScale: scale,
        stagePosition: position,
        lastTouchDistance: 0,
        lastPointerPosition: undefined
      }
    });
    if ((mode as CanvasMode) === CanvasMode.Pen) {
      dispatch({ type: CanvasActionType.EndLine });
    } else if ((mode as CanvasMode) === CanvasMode.Eraser) {
      dispatch({ type: CanvasActionType.EndErase });
    } else if ((mode as CanvasMode) === CanvasMode.View) {
      dispatch({ type: CanvasActionType.SetDraggable, payload: true });
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
      dispatch({ type: CanvasActionType.DeleteLine, payload: index });
    }
  };

  const handleLineEnter = index => {
    if (mode === CanvasMode.Eraser && canvasState.isDrawing) {
      dispatch({ type: CanvasActionType.DeleteLine, payload: index });
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={scale}
      scaleY={scale}
      x={position.x}
      y={position.y}
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
              strokeHitEnabled={false}
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
            strokeHitEnabled={(mode as CanvasMode) === CanvasMode.Eraser}
            hitStrokeWidth={5}
            globalCompositeOperation={line.type}
            lineJoin="round"
            lineCap="round"
            onClick={() => handleLineClick(i)}
            onTap={() => handleLineClick(i)}
            onMouseEnter={() => handleLineEnter(i)}
            onTouchMove={() => handleLineEnter(i)}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Canvas;
