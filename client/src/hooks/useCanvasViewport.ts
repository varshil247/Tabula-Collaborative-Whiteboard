/**
 * Custom hook for canvas pan and zoom operations
 * Handles viewport movement and scaling interactions
 */

import { useState, useCallback } from "react";
import { CANVAS } from "../utils/constants";
import {
  calculateNewZoom,
  calculateZoomPosition,
  convertMinimapClickToStagePos,
} from "../utils/canvasUtils";

interface DragState {
  dragX: number;
  dragY: number;
}

/**
 * Hook for managing canvas viewport (pan and zoom)
 * @returns Object with state and handlers for viewport operations
 */
export const useCanvasViewport = () => {
  const [dragState, setDragState] = useState<DragState>({ dragX: 0, dragY: 0 });
  const [stageScale, setStageScale] = useState(1);

  /**
   * Handles mouse wheel zoom
   * @param e - Wheel event from Konva stage
   * @param stageRef - Reference to Konva stage
   */
  const handleWheel = useCallback((e: any, stageRef: any) => {
    e.evt.preventDefault();
    if (!stageRef) return;

    const oldScale = stageRef.scaleX();
    const pointer = stageRef.getPointerPosition();
    const newScale = calculateNewZoom(oldScale, e.evt.deltaY);

    if (newScale === oldScale) return; // No change needed

    const newPos = calculateZoomPosition(pointer, oldScale, newScale, stageRef.x(), stageRef.y());

    setStageScale(newScale);
    setDragState(newPos);
  }, []);

  /**
   * Handles stage panning (dragging background)
   * @param e - Drag end event from Konva stage
   */
  const handleDragMove = useCallback((e: any) => {
    if (e.target?.getStage) {
      const stage = e.target.getStage();
      if (stage) {
        setDragState({ dragX: stage.x(), dragY: stage.y() });
      }
    }
  }, []);

  /**
   * Handles minimap click to pan viewport
   * @param e - Click event on minimap
   * @param boardWidth - Width of the canvas board
   * @param boardHeight - Height of the canvas board
   */
  const handleMinimapClick = useCallback(
    (e: any, boardWidth: number, boardHeight: number) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const newPos = convertMinimapClickToStagePos(
        clickX,
        clickY,
        boardWidth,
        boardHeight,
        stageScale,
      );

      setDragState(newPos);
    },
    [stageScale],
  );

  /**
   * Zooms in (increases scale)
   */
  const zoomIn = useCallback(() => {
    setStageScale((prev) => Math.min(prev * 1.2, CANVAS.MAX_ZOOM));
  }, []);

  /**
   * Zooms out (decreases scale)
   */
  const zoomOut = useCallback(() => {
    setStageScale((prev) => Math.max(prev / 1.2, CANVAS.MIN_ZOOM));
  }, []);

  /**
   * Resets zoom and pan to initial state
   */
  const resetZoom = useCallback(() => {
    setStageScale(1);
    setDragState({ dragX: 0, dragY: 0 });
  }, []);

  /**
   * Sets custom drag state directly
   */
  const setViewport = useCallback((x: number, y: number, scale: number) => {
    setDragState({ dragX: x, dragY: y });
    setStageScale(scale);
  }, []);

  return {
    dragState,
    stageScale,
    handleWheel,
    handleDragMove,
    handleMinimapClick,
    zoomIn,
    zoomOut,
    resetZoom,
    setViewport,
  };
};
