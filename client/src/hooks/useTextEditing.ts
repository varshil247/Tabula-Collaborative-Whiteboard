/**
 * Custom hook for text editing functionality
 * Handles text object selection, editing, and updates
 */

import { useState, useCallback } from "react";
import { HISTORY_TYPES } from "../utils/constants";

/**
 * Hook for managing text editing state and operations
 * @param shapes - Current array of shapes
 * @param syncShapes - Callback to sync updated shapes to server
 * @param addToHistory - Callback to add action to history
 * @returns Object with text editing state and handlers
 */
export const useTextEditing = (
  shapes: any[],
  syncShapes: (updatedShapes: any[]) => void,
  addToHistory: (action: any) => void,
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  /**
   * Starts editing a text shape
   * @param shapeId - UUID of the text shape
   * @param currentText - Current text content
   */
  const startEditing = useCallback((shapeId: string, currentText: string) => {
    setEditingId(shapeId);
    setEditingText(currentText);
    setIsEditing(true);
  }, []);

  /**
   * Saves text changes to the store and broadcasts to other clients
   */
  const saveTextChanges = useCallback(() => {
    if (!editingId) return;

    const updatedShapes = shapes.map((shape: any) => {
      if (shape.uuid === editingId && shape.config.text !== editingText) {
        addToHistory({
          type: HISTORY_TYPES.EDIT,
          uuid: shape.uuid,
          prevText: shape.config.text,
          newText: editingText,
        });
        return { ...shape, config: { ...shape.config, text: editingText } };
      }
      return shape;
    });

    syncShapes(updatedShapes);
    setIsEditing(false);
    setEditingId(null);
  }, [editingId, editingText, shapes, syncShapes, addToHistory]);

  /**
   * Updates text live for other participants
   */
  const updateTextLive = useCallback(
    (text: string, onLiveUpdate: (obj: any) => void) => {
      setEditingText(text);
      if (!editingId) return;

      const shape = shapes.find((s) => s.uuid === editingId);
      if (shape) {
        onLiveUpdate({ ...shape, config: { ...shape.config, text } });
      }
    },
    [editingId, shapes],
  );

  /**
   * Cancels editing without saving
   */
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditingId(null);
    setEditingText("");
  }, []);

  return {
    isEditing,
    editingId,
    editingText,
    setIsEditing,
    setEditingText,
    startEditing,
    saveTextChanges,
    updateTextLive,
    cancelEditing,
  };
};
