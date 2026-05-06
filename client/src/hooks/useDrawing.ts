/**
 * Custom hook for pen/drawing tool functionality
 * Handles line creation, tracking, and rendering
 */

import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

interface DrawingLine {
  uuid: string;
  shape: string;
  posX: number;
  posY: number;
  user: string;
  config: {
    points: number[];
    stroke: string;
    strokeWidth: number;
    globalCompositeOperation: string;
  };
}

/**
 * Hook for managing pen drawing state and operations
 * @returns Object with drawing state and handlers
 */
export const useDrawing = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState<DrawingLine[]>([]);
  
  // Use a ref to track the current line for immediate access in event handlers
  const currentLineRef = useRef<DrawingLine | null>(null);

  /**
   * Starts a new drawing line
   * @param startPoint - Initial point {x, y}
   * @param color - Line color (hex)
   * @param thickness - Line thickness in pixels
   * @param userId - ID of the user drawing
   * @returns The newly created line object
   */
  const startDrawing = useCallback(
    (startPoint: { x: number; y: number }, color: string, thickness: number, userId: string = "anonymous") => {
      const newLine: DrawingLine = {
        uuid: uuidv4(),
        shape: "pen",
        posX: 0,
        posY: 0,
        user: userId,
        config: {
          points: [startPoint.x, startPoint.y],
          stroke: color,
          strokeWidth: thickness,
          globalCompositeOperation: "source-over",
        },
      };

      currentLineRef.current = newLine;
      setLines((prev) => [...prev, newLine]);
      setIsDrawing(true);
      
      return newLine;
    },
    [],
  );

  /**
   * Updates the current drawing line with a new point
   * @param newPoint - New point to add {x, y}
   * @returns The updated line object or null
   */
  const addPointToLine = useCallback((newPoint: { x: number; y: number }) => {
    if (!currentLineRef.current) return null;

    // Update the ref immediately for real-time emission
    const updatedLine = {
      ...currentLineRef.current,
      config: {
        ...currentLineRef.current.config,
        points: [...currentLineRef.current.config.points, newPoint.x, newPoint.y],
      },
    };
    currentLineRef.current = updatedLine;

    // Update the state for rendering
    setLines((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = updatedLine;
      return updated;
    });

    return updatedLine;
  }, []);

  /**
   * Finishes the current drawing line
   * @returns The completed line or null
   */
  const finishDrawing = useCallback((): DrawingLine | null => {
    setIsDrawing(false);
    const completed = currentLineRef.current;
    currentLineRef.current = null;
    return completed;
  }, []);

  /**
   * Clears all in-progress lines (useful for undo/reset)
   */
  const clearLines = useCallback(() => {
    setLines([]);
    currentLineRef.current = null;
    setIsDrawing(false);
  }, []);

  /**
   * Removes a specific line from the preview
   */
  const removeLine = useCallback((uuid: string) => {
    setLines((prev) => prev.filter((l) => l.uuid !== uuid));
  }, []);

  return {
    isDrawing,
    currentLine: currentLineRef.current,
    lines,
    startDrawing,
    addPointToLine,
    finishDrawing,
    clearLines,
    removeLine,
  };
};
