/**
 * Custom hook for eraser tool functionality
 * Handles point-based erasure on pen strokes and shape detection
 */

import { useCallback, useRef, useState } from "react";
import { calculateErasedShapes } from "../utils/canvasUtils";
import { ERASER } from "../utils/constants";

/**
 * Hook for managing eraser tool state and operations
 * @param onShapesUpdate - Callback when shapes are erased
 * @returns Object with eraser functions and state management
 */
export const useEraser = (onShapesUpdate?: (shapes: any[]) => void) => {
  const [eraserPos, setEraserPos] = useState<{ x: number; y: number } | null>(null);
  const preEraseShapesRef = useRef<any[] | null>(null);

  /**
   * Erases shapes or parts of shapes at the given position
   * Uses radius-based hit detection to determine what to erase
   * @param pos - Position to erase at
   * @param shapes - Current shapes array
   * @param eraserRadius - Radius of eraser effect (in pixels)
   * @returns Updated shapes array after erasure
   */
  const eraseAtPosition = useCallback(
    (pos: { x: number; y: number }, shapes: any[], eraserRadius: number = ERASER.RADIUS) => {
      const result = calculateErasedShapes(pos, shapes);

      if (onShapesUpdate && result.shapeModified) {
        onShapesUpdate(result.updatedShapes);
      }

      return result;
    },
    [onShapesUpdate],
  );

  /**
   * Saves the current shapes state before starting erase operation
   * Used to create undo history
   */
  const savePreEraseState = useCallback((shapes: any[]) => {
    preEraseShapesRef.current = [...shapes];
  }, []);

  /**
   * Gets the saved pre-erase state
   * @returns Array of shapes before erase or null
   */
  const getPreEraseState = useCallback(() => {
    return preEraseShapesRef.current;
  }, []);

  /**
   * Clears the pre-erase state
   */
  const clearPreEraseState = useCallback(() => {
    preEraseShapesRef.current = null;
  }, []);

  return {
    eraseAtPosition,
    savePreEraseState,
    getPreEraseState,
    clearPreEraseState,
  };
};
