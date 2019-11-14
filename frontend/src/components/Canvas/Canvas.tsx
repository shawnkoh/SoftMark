import React, {
  useReducer,
  useCallback,
  useRef,
  useEffect,
  useState
} from "react";
import { Stage, Layer, Line } from "react-konva";
import produce from "immer";
import isEqual from "lodash.isequal";

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
        lastDist: number;
        viewPortPosition: Point | undefined;
      };
    }
  | { type: CanvasActionType.SetDraggable; payload: boolean };

interface CanvasState {
  lines: AnnotationLine[];
  isDrawing: boolean;
  lastDist: number;
  draggable: boolean;
  viewPortPosition: Point | undefined;
}

const createCanvasStateReducer = ({
  penColor,
  penWidth,
  onForegroundAnnotationChange,
  onViewChange,
  scale
}: Pick<
  CanvasProps,
  | "penColor"
  | "penWidth"
  | "onForegroundAnnotationChange"
  | "onViewChange"
  | "scale"
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
      /*
      nextState = produce(state, draftState => {
        draftState.stageScale = action.payload.stageScale;
        draftState.stagePosition = action.payload.stagePosition;
        draftState.lastDist = action.payload.lastDist;
      });
      console.log(nextState);
      */
      nextState = produce(state, draftState => {
        draftState.lastDist = action.payload.lastDist;
        draftState.viewPortPosition = action.payload.viewPortPosition;
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
      /*
      nextState = produce(state, draftState => {
        draftState.stagePosition = action.payload;
      });
      */
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
  const initialCanvasState = {
    lines: foregroundAnnotation,
    isDrawing: false,
    lastDist: 0,
    draggable: false,
    viewPortPosition: undefined
  };

  const memoizedCanvasStateReducer = useCallback(
    createCanvasStateReducer({
      penColor,
      penWidth,
      onForegroundAnnotationChange,
      onViewChange,
      scale
    }),
    [penColor, penWidth, onForegroundAnnotationChange, onViewChange]
  );

  const [canvasState, dispatch] = useReducer(
    memoizedCanvasStateReducer,
    initialCanvasState
  );

  useEffect(() => {
    console.log("foregroundAnnotation effect raised");
    if (!isEqual(foregroundAnnotation, canvasState.lines)) {
      console.log("foregroundAnnotation effect dispatches");
      dispatch({
        type: CanvasActionType.ReplaceForegroundAnnotation,
        payload: foregroundAnnotation
      });
    }
  }, [foregroundAnnotation]); // Ignore warning - do not change dependency array!

  /*
  useEffect(() => {
    console.log("position effect raised");
    if (!(isEqual(position, canvasState.stagePosition))) {
      console.log("position effect dispatches");
      dispatch({
        type: CanvasActionType.PanZoom,
        payload: {
          stagePosition: position,
          stageScale: canvasState.stageScale,
          lastDist: canvasState.lastDist
        }
      });
    }
  }, [position]); // Ignore warning - do not change dependency array!

  useEffect(() => {
    console.log("scale effect raised");
    if (!(isEqual(scale, canvasState.stageScale))) {
      console.log(`scale effect dispatches, scale:${scale}, stageScale:${canvasState.stageScale}`);
      dispatch({
        type: CanvasActionType.PanZoom,
        payload: {
          stagePosition: canvasState.stagePosition,
          stageScale: scale,
          lastDist: canvasState.lastDist
        }
      });
    }
  }, [scale]); // Ignore warning - do not change dependency array!
  */

  const stageRef = useRef<any>(null);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const mouseDown = () => setIsMouseDown(true);
  const mouseUp = () => setIsMouseDown(false);

  const handleMouseDown = event => {
    console.log("handleMouseDown");
    mouseDown();
    if ((mode as CanvasMode) === CanvasMode.Pen) {
      dispatch({ type: CanvasActionType.BeginLine });
    } else if ((mode as CanvasMode) === CanvasMode.Eraser) {
      dispatch({ type: CanvasActionType.BeginErase });
    }

    dispatch({
      type: CanvasActionType.SetDraggable,
      payload: true
    });
  };

  const handleMouseMove = event => {
    console.log("handleMouseMove");
    dispatch({
      type: CanvasActionType.SetDraggable,
      payload: true
    });
    if ((mode as CanvasMode) === CanvasMode.Pen) {
      const currentStageRef = stageRef.current;
      if (currentStageRef) {
        const stage = currentStageRef.getStage();
        const point = getRelativePointerPosition(stage);
        dispatch({ type: CanvasActionType.ContinueLine, payload: point });
      }
    }
  };

  const handleMouseUp = event => {
    mouseUp();
    console.log("handle mouse up");
    if ((mode as CanvasMode) === CanvasMode.Pen) {
      dispatch({ type: CanvasActionType.EndLine });
    } else if ((mode as CanvasMode) === CanvasMode.Eraser) {
      dispatch({ type: CanvasActionType.EndErase });
    }
  };

  const handleMouseWheel = event => {
    console.log("handle mouse wheel");
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
            lastDist: canvasState.lastDist,
            viewPortPosition: undefined
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
            lastDist: canvasState.lastDist,
            viewPortPosition: undefined
          }
        });
      }
    }
  };

  ///////////////////////    Touch start    ////////////////////////////////
  const handleTouchStart = event => {
    console.log("handleTouchStart");
    if (event.evt.touches.length === 1) {
      if ((mode as CanvasMode) === CanvasMode.Pen) {
        dispatch({ type: CanvasActionType.BeginLine });
      } else if ((mode as CanvasMode) === CanvasMode.Eraser) {
        dispatch({ type: CanvasActionType.BeginErase });
      } else {
        dispatch({
          type: CanvasActionType.SetDraggable,
          payload: true
        });
      }

      /* else if ((mode as CanvasMode) === CanvasMode.View) {
        dispatch({
          type: CanvasActionType.SetDraggable,
          payload: true
        });
      }*/
    } else {
      dispatch({
        type: CanvasActionType.SetDraggable,
        payload: false
      });
    }
  };

  const handleTouchMove = event => {
    console.log("handleTouchMove");
    dispatch({
      type: CanvasActionType.SetDraggable,
      payload: false
    });
    const currentStageRef = stageRef.current;
    if (currentStageRef) {
      const stage = currentStageRef.getStage();
      const touches = event.evt.touches;
      if (touches.length > 1) {
        //console.log("2 touch");
        const touch1 = touches[0];
        const touch2 = touches[1];
        //if ((mode as CanvasMode) === CanvasMode.View) {
        //dispatch({ type: CanvasActionType.SetDraggable, payload: false });

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
        const currViewPortPoint = { x: currX, y: currY };
        const pointer = getClientPointerRelativeToStage(currX, currY, stage);

        if (!canvasState.lastDist) {
          dispatch({
            type: CanvasActionType.PanZoom,
            payload: {
              stageScale: scale,
              stagePosition: position,
              viewPortPosition: canvasState.viewPortPosition,
              lastDist: dist
            }
          });
        }
        if (!canvasState.viewPortPosition) {
          //console.log("intitialize");
          //console.log(canvasState.viewPortPosition);
          canvasState.viewPortPosition = { x: currX, y: currY };
        }

        const viewPortPosition = canvasState.viewPortPosition;
        const prevX = viewPortPosition.x;
        const prevY = viewPortPosition.y;
        const diffX = currX - prevX;
        const diffY = currY - prevY;

        /*console.log("previous viewport Position");
          console.log(viewPortPosition);
          console.log("current viewport position");
          console.log(currViewPortPoint);
          console.log("diffX: " + diffX);
          console.log("diffY: " + diffY);*/

        const oldScale = stage.scaleX();
        const startPos = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale
        };
        /*const startPos = {
            x: pointer.x / oldScale - stage.x() / oldScale,
            y: pointer.y / oldScale - stage.y() / oldScale
          };*/

        const newScale =
          (oldScale * dist) /
          (canvasState.lastDist ? canvasState.lastDist : dist);
        const newPosition = {
          x: ((pointer.x + diffX) / newScale - startPos.x) * newScale,
          y: ((pointer.y + diffY) / newScale - startPos.y) * newScale
        };
        /*const newPosition = {
            x: (pointer.x / newScale - startPos.x) * newScale,
            y: (pointer.y / newScale - startPos.y) * newScale
          };*/

        dispatch({
          type: CanvasActionType.PanZoom,
          payload: {
            stageScale: newScale,
            stagePosition: newPosition,
            lastDist: dist,
            viewPortPosition: currViewPortPoint
          }
        });

        //console.log("touch move event");
        //console.log(event);

        //}
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
    console.log("handleTouchEnd");
    dispatch({
      type: CanvasActionType.SetDraggable,
      payload: true
    });
    dispatch({
      type: CanvasActionType.PanZoom,
      payload: {
        stageScale: scale,
        stagePosition: position,
        lastDist: 0,
        viewPortPosition: undefined
      }
    });
    if ((mode as CanvasMode) === CanvasMode.Pen) {
      dispatch({ type: CanvasActionType.EndLine });
    } else if ((mode as CanvasMode) === CanvasMode.Eraser) {
      dispatch({ type: CanvasActionType.EndErase });
    }
  };
  ///////////////////////    Touch end    ////////////////////////////////

  const handleDrag = event => {
    /* console.log("handle drag");
    if( isMouseDown){ //(event.evt && event.evt.touches && event.evt.touches.length === 2) ||
      console.log("pointer is down: " + isMouseDown);
      dispatch({
        type: CanvasActionType.Drag,
        payload: { x: event.target.x(), y: event.target.y() }
      });
    }*/
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
            onMouseEnter={() => handleLineEnter(i)}
            onTouchMove={() => handleLineEnter(i)}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Canvas;
