/**
 * Custom hook for shape selection management
 * Handles single/multi-select, selection box, and shape manipulation
 */

import { useState, useCallback } from "react";
import { getShapesInSelectionBox } from "../utils/canvasUtils";
import { SELECTION } from "../utils/constants";

interface SelectionBox {
  visible: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Hook for managing shape selection state and operations
 * Supports single selection, multi-selection, and drag-selection box
 * @returns Object with selection state and handlers
 */
export const useShapeSelection = () => {
  const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  /**
   * Handles shape click for single or multi-select
   * Ctrl/Cmd+Click adds to selection, Shift+Click also adds
   * @param id - Shape UUID to select
   * @param isMultiSelect - Whether multi-select modifier is pressed
   */
  const handleSelectShape = useCallback((id: string, isMultiSelect: boolean = false) => {
    setSelectedShapeIds((prev) => {
      if (isMultiSelect) {
        // Toggle selection on Ctrl+Click
        return prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id];
      } else {
        // Single select otherwise
        return prev.includes(id) ? prev : [id];
      }
    });
  }, []);

  /**
   * Initiates a drag selection box
   * @param startPoint - Starting point {x, y}
   */
  const startSelectionBox = useCallback((startPoint: { x: number; y: number }) => {
    setSelectionBox({
      visible: true,
      x1: startPoint.x,
      y1: startPoint.y,
      x2: startPoint.x,
      y2: startPoint.y,
    });
  }, []);

  /**
   * Updates the selection box as user drags
   * @param currentPoint - Current pointer position {x, y}
   */
  const updateSelectionBox = useCallback((currentPoint: { x: number; y: number }) => {
    setSelectionBox((prev) => {
      if (!prev || !prev.visible) return prev;
      return { ...prev, x2: currentPoint.x, y2: currentPoint.y };
    });
  }, []);

  /**
   * Completes the selection box operation
   * Selects all shapes that intersect with the box
   * @param shapes - Array of all shapes to check
   */
  const completeSelectionBox = useCallback(
    (shapes: any[]) => {
      if (!selectionBox || !selectionBox.visible) {
        setSelectionBox(null);
        return;
      }

      const box = {
        x: Math.min(selectionBox.x1, selectionBox.x2),
        y: Math.min(selectionBox.y1, selectionBox.y2),
        width: Math.abs(selectionBox.x1 - selectionBox.x2),
        height: Math.abs(selectionBox.y1 - selectionBox.y2),
      };

      // Only apply selection if box is meaningful size
      if (box.width > SELECTION.MIN_BOX_SIZE && box.height > SELECTION.MIN_BOX_SIZE) {
        const newlySelectedIds = getShapesInSelectionBox(shapes, box, selectedShapeIds);
        setSelectedShapeIds(newlySelectedIds);
      } else {
        setSelectedShapeIds([]);
      }

      setSelectionBox(null);
    },
    [selectionBox, selectedShapeIds],
  );

  return {
    selectedShapeIds,
    setSelectedShapeIds,
    selectionBox,
    setSelectionBox,
    handleSelectShape,
    startSelectionBox,
    updateSelectionBox,
    completeSelectionBox,
  };
};
