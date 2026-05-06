/**
 * Main Canvas component wrapping the Konva Stage
 * Handles all mouse/touch events and coordinates shape rendering
 */

import React from "react";
import { Stage, Layer, Transformer, Rect, Circle, Text, Path } from "react-konva";
import { ShapeRenderer } from "./ShapeRenderer";
import { TOOLS, ERASER } from "../../utils/constants";

interface CanvasProps {
  boardWidth: number;
  boardHeight: number;
  stageRef: React.RefObject<any>;
  trRef: React.RefObject<any>;
  dragX: number;
  dragY: number;
  stageScale: number;
  activeTool: string;
  selectedShapeIds: string[];
  shapes: any[];
  remoteLiveObjects: Map<string, any>;
  remoteDrawings: Map<string, any>;
  currentShape: any;
  lines: any[];
  selectionBox: any;
  eraserPos: { x: number; y: number } | null;
  remoteCursors: Map<string, any>;
  onPointerDown: (e: any) => void;
  onPointerMove: (e: any) => void;
  onPointerUp: (e: any) => void;
  onWheel: (e: any) => void;
  onMouseLeave: () => void;
  onDragMoveStage: (e: any) => void;
  onSelectShape: (e: any, id: string) => void;
  onTransformMove: (e: any, id: string) => void;
  onTransformEnd: (shape: any, e: any) => void;
  onTextDblClick: (shape: any) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  boardWidth,
  boardHeight,
  stageRef,
  trRef,
  dragX,
  dragY,
  stageScale,
  activeTool,
  selectedShapeIds,
  shapes,
  remoteLiveObjects,
  remoteDrawings,
  currentShape,
  lines,
  selectionBox,
  eraserPos,
  remoteCursors,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  onMouseLeave,
  onDragMoveStage,
  onSelectShape,
  onTransformMove,
  onTransformEnd,
  onTextDblClick,
}) => {
  return (
    <Stage
      width={boardWidth}
      height={boardHeight}
      onMouseDown={onPointerDown}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
      onWheel={onWheel}
      onMouseLeave={onMouseLeave}
      draggable={activeTool === TOOLS.SELECT && selectedShapeIds.length === 0}
      onDragMove={onDragMoveStage}
      x={dragX}
      y={dragY}
      scaleX={stageScale}
      scaleY={stageScale}
      ref={stageRef}
      className={`w-full h-full outline-none ${
        activeTool === TOOLS.SELECT
          ? selectedShapeIds.length > 0
            ? "cursor-pointer"
            : "cursor-grab active:cursor-grabbing"
          : activeTool === TOOLS.ERASER
            ? "cursor-none"
            : "cursor-pointer"
      }`}
    >
      <Layer>
        {/* Render shapes from Redux, preferring live remote updates if available */}
        {shapes.map((s) => {
          const remoteUpdate = remoteLiveObjects.get(s.uuid);
          return (
            <ShapeRenderer
              key={s.uuid}
              shape={s}
              activeTool={activeTool}
              selectedShapeIds={selectedShapeIds}
              stageScale={stageScale}
              remoteLiveObject={remoteUpdate}
              onSelect={onSelectShape}
              onTransformMove={onTransformMove}
              onTransformEnd={onTransformEnd}
              onTextDblClick={onTextDblClick}
              opacity={remoteUpdate ? 0.7 : 1}
            />
          );
        })}

        {/* Render remote objects that don't exist locally yet (e.g. new shapes being dragged) */}
        {Array.from(remoteLiveObjects.values())
          .filter((o) => !shapes.find((s: any) => s.uuid === o.uuid))
          .map((o) => (
            <ShapeRenderer
              key={o.uuid}
              shape={o}
              activeTool={activeTool}
              selectedShapeIds={selectedShapeIds}
              stageScale={stageScale}
              isLive
              opacity={0.6}
              remoteLiveObject={o}
            />
          ))}

        {/* Render local shape currently being drawn */}
        {currentShape && (
          <ShapeRenderer
            shape={currentShape}
            activeTool={activeTool}
            selectedShapeIds={[]}
            stageScale={stageScale}
            isLive
          />
        )}

        {/* Render remote lines being drawn */}
        {Array.from(remoteDrawings.values()).map((l) => (
          <ShapeRenderer
            key={l.uuid}
            shape={l}
            activeTool={activeTool}
            selectedShapeIds={[]}
            stageScale={stageScale}
            isLive
            opacity={0.8}
          />
        ))}

        {/* Render local lines (preview before finalize) */}
        {lines.map((l) => (
          <ShapeRenderer
            key={l.uuid}
            shape={l}
            activeTool={activeTool}
            selectedShapeIds={[]}
            stageScale={stageScale}
            isLive
          />
        ))}

        {/* Transformer Overlay for Single/Multi-Select */}
        {selectedShapeIds.length > 0 && (
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) =>
              Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5 ? oldBox : newBox
            }
            borderStroke="#3b82f6"
            anchorStroke="#3b82f6"
            anchorFill="#ffffff"
            anchorSize={8 / stageScale}
          />
        )}

        {/* Selection Box Overlay */}
        {selectionBox?.visible && (
          <Rect
            x={Math.min(selectionBox.x1, selectionBox.x2)}
            y={Math.min(selectionBox.y1, selectionBox.y2)}
            width={Math.abs(selectionBox.x1 - selectionBox.x2)}
            height={Math.abs(selectionBox.y1 - selectionBox.y2)}
            fill="rgba(59, 130, 246, 0.3)"
            stroke="#3b82f6"
            strokeWidth={1 / stageScale}
            listening={false}
          />
        )}

        {/* Visual Custom Eraser Cursor */}
        {activeTool === TOOLS.ERASER && eraserPos && (
          <Circle
            x={eraserPos.x}
            y={eraserPos.y}
            radius={ERASER.RADIUS / stageScale}
            stroke={ERASER.COLOR}
            strokeWidth={2 / stageScale}
            fill={`rgba(239, 68, 68, ${ERASER.OPACITY})`}
            listening={false}
          />
        )}

        {/* Render Remote Cursors */}
        {Array.from(remoteCursors.values()).map((cursor) => (
          <React.Fragment key={cursor.userId}>
            <Path
              x={cursor.x}
              y={cursor.y}
              data="M0,0 L0,15 L4,11 L8,18 L10,16 L6,10 L11,10 Z"
              fill="#4338ca"
              stroke="white"
              strokeWidth={0.5 / stageScale}
              scaleX={1 / stageScale}
              scaleY={1 / stageScale}
              listening={false}
              shadowColor="black"
              shadowBlur={2}
              shadowOpacity={0.2}
            />
            <Rect
              x={cursor.x + 10 / stageScale}
              y={cursor.y + 12 / stageScale}
              width={(cursor.userName.length * 5) / stageScale}
              height={12 / stageScale}
              fill="rgba(67, 56, 202, 0.9)"
              cornerRadius={2 / stageScale}
              listening={false}
            />
            <Text
              x={cursor.x + 14 / stageScale}
              y={cursor.y + 14 / stageScale}
              text={cursor.userName}
              fontSize={8 / stageScale}
              fill="white"
              fontStyle="bold"
              listening={false}
            />
          </React.Fragment>
        ))}
      </Layer>
    </Stage>
  );
};
