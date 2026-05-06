/**
 * Interactive Minimap component providing a bird's-eye view of the canvas
 * Allows clicking to quickly pan to different areas
 */

import React from "react";
import { Stage, Layer } from "react-konva";
import { ShapeRenderer } from "./ShapeRenderer";
import { CANVAS } from "../../utils/constants";

interface MinimapProps {
  shapes: any[];
  remoteLiveObjects: Map<string, any>;
  remoteDrawings: Map<string, any>;
  currentShape: any;
  lines: any[];
  boardWidth: number;
  boardHeight: number;
  dragX: number;
  dragY: number;
  stageScale: number;
  onMinimapClick: (e: any) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  shapes,
  remoteLiveObjects,
  remoteDrawings,
  currentShape,
  lines,
  boardWidth,
  boardHeight,
  dragX,
  dragY,
  stageScale,
  onMinimapClick,
}) => {
  return (
    <div
      className="w-[140px] h-[90px] bg-secondary/80 backdrop-blur-xl border border-border/50 shadow-sm rounded-xl relative overflow-hidden flex items-center justify-center pointer-events-auto cursor-pointer"
      onClick={onMinimapClick}
      title="Minimap (Click to Pan)"
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:10px_10px]" />
      <div className="absolute inset-0 pointer-events-none">
        <Stage
          width={CANVAS.MINIMAP_WIDTH}
          height={CANVAS.MINIMAP_HEIGHT}
          scaleX={CANVAS.MINIMAP_SCALE}
          scaleY={CANVAS.MINIMAP_SCALE}
          x={CANVAS.MINIMAP_CENTER_X}
          y={CANVAS.MINIMAP_CENTER_Y}
        >
          <Layer listening={false}>
            {shapes.map((s: any) => (
              <ShapeRenderer
                key={s.uuid}
                shape={s}
                activeTool="select"
                selectedShapeIds={[]}
                stageScale={CANVAS.MINIMAP_SCALE}
                isLive
              />
            ))}
            {Array.from(remoteLiveObjects.values())
              .filter((o) => !shapes.find((s: any) => s.uuid === o.uuid))
              .map((o) => (
                <ShapeRenderer
                  key={o.uuid}
                  shape={o}
                  activeTool="select"
                  selectedShapeIds={[]}
                  stageScale={CANVAS.MINIMAP_SCALE}
                  isLive
                  opacity={0.6}
                />
              ))}
            {currentShape && (
              <ShapeRenderer
                key={currentShape.uuid}
                shape={currentShape}
                activeTool="select"
                selectedShapeIds={[]}
                stageScale={CANVAS.MINIMAP_SCALE}
                isLive
              />
            )}
            {lines.map((l) => (
              <ShapeRenderer
                key={l.uuid}
                shape={l}
                activeTool="select"
                selectedShapeIds={[]}
                stageScale={CANVAS.MINIMAP_SCALE}
                isLive
              />
            ))}
            {Array.from(remoteDrawings.values()).map((l) => (
              <ShapeRenderer
                key={l.uuid}
                shape={l}
                activeTool="select"
                selectedShapeIds={[]}
                stageScale={CANVAS.MINIMAP_SCALE}
                isLive
                opacity={0.6}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <div
        className="absolute bg-brand/10 border-[1.5px] border-brand rounded shadow-[0_0_0_9999px_rgba(0,0,0,0.15)] pointer-events-none"
        style={{
          width: `${(boardWidth / stageScale) * CANVAS.MINIMAP_SCALE}px`,
          height: `${(boardHeight / stageScale) * CANVAS.MINIMAP_SCALE}px`,
          transform: `translate(${CANVAS.MINIMAP_CENTER_X + (-dragX / stageScale) * CANVAS.MINIMAP_SCALE}px, ${CANVAS.MINIMAP_CENTER_Y + (-dragY / stageScale) * CANVAS.MINIMAP_SCALE}px)`,
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
};
