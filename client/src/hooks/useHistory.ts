/**
 * Custom hook for managing canvas history (Undo/Redo)
 * Tracks create, transform, delete, and erase operations
 */

import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setCanvasState } from "../redux/slices/canvasSlice";
import { HISTORY_TYPES } from "../utils/constants";

/**
 * Hook for managing undo/redo operations on the canvas
 * @param shapes - Current array of shapes from Redux
 * @param syncToSocket - Callback to broadcast updates to other clients
 * @returns Object with history state and handlers
 */
export const useHistory = (shapes: any[], syncToSocket: (updatedShapes: any) => void) => {
  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const dispatch = useDispatch();

  /**
   * Adds a new action to the history stack and clears redo stack
   * @param action - Action object describing the change
   */
  const addToHistory = useCallback((action: any) => {
    setHistory((prev) => [...prev, action]);
    setRedoStack([]);
  }, []);

  /**
   * Reverts the last action performed
   */
  const undo = useCallback(() => {
    if (history.length === 0) return;

    const updatedHistory = [...history];
    const last = updatedHistory.pop();
    setHistory(updatedHistory);

    let updatedShapes = [...shapes];

    switch (last.type) {
      case HISTORY_TYPES.CREATE:
      case HISTORY_TYPES.DRAW:
        updatedShapes = updatedShapes.filter((s) => s.uuid !== last.uuid);
        break;
      case HISTORY_TYPES.TRANSFORM:
        updatedShapes = updatedShapes.map((s) => (s.uuid === last.uuid ? last.prevShape : s));
        break;
      case HISTORY_TYPES.DELETE:
        updatedShapes = [...updatedShapes, last.object];
        break;
      case HISTORY_TYPES.DELETE_MULTI:
        updatedShapes = [...updatedShapes, ...last.objects];
        break;
      case HISTORY_TYPES.ERASE_BATCH:
        updatedShapes = last.previousShapes;
        break;
      case HISTORY_TYPES.EDIT:
        updatedShapes = updatedShapes.map((s) =>
          s.uuid === last.uuid ? { ...s, config: { ...s.config, text: last.prevText } } : s,
        );
        break;
      case HISTORY_TYPES.CLEAR:
        updatedShapes = [...last.previousShapes];
        break;
    }

    dispatch(setCanvasState(updatedShapes));
    syncToSocket(updatedShapes);
    setRedoStack((prev) => [...prev, last]);
  }, [history, shapes, dispatch, syncToSocket]);

  /**
   * Re-applies the last undone action
   */
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const updatedRedo = [...redoStack];
    const next = updatedRedo.pop();
    setRedoStack(updatedRedo);

    let updatedShapes = [...shapes];

    switch (next.type) {
      case HISTORY_TYPES.CREATE:
      case HISTORY_TYPES.DRAW:
        updatedShapes = [...updatedShapes, next.object];
        break;
      case HISTORY_TYPES.TRANSFORM:
        updatedShapes = updatedShapes.map((s) => (s.uuid === next.uuid ? next.newShape : s));
        break;
      case HISTORY_TYPES.DELETE:
        updatedShapes = updatedShapes.filter((s) => s.uuid !== next.uuid);
        break;
      case HISTORY_TYPES.DELETE_MULTI:
        updatedShapes = updatedShapes.filter((s) => !next.uuids.includes(s.uuid));
        break;
      case HISTORY_TYPES.ERASE_BATCH:
        updatedShapes = next.newShapes;
        break;
      case HISTORY_TYPES.EDIT:
        updatedShapes = updatedShapes.map((s) =>
          s.uuid === next.uuid ? { ...s, config: { ...s.config, text: next.newText } } : s,
        );
        break;
      case HISTORY_TYPES.CLEAR:
        updatedShapes = [];
        break;
    }

    dispatch(setCanvasState(updatedShapes));
    syncToSocket(updatedShapes);
    setHistory((prev) => [...prev, next]);
  }, [redoStack, shapes, dispatch, syncToSocket]);

  /**
   * Clears all history (useful when joining a new room)
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setRedoStack([]);
  }, []);

  return {
    undo,
    redo,
    addToHistory,
    clearHistory,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
  };
};
