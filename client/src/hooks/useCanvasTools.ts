/**
 * Custom hook for managing canvas drawing tools
 * Handles tool selection, configuration, and menus
 */

import { useState, useCallback } from "react";
import { COLORS, TOOLS } from "../utils/constants";

/**
 * Hook for managing tool state and configuration
 * @returns Object with tool state and update functions
 */
export const useCanvasTools = () => {
  const [activeTool, setActiveTool] = useState<string>(TOOLS.SELECT);
  const [penColor, setPenColor] = useState(COLORS[0]); // Black
  const [penThickness, setPenThickness] = useState(3);
  const [selectedShapeColor, setSelectedShapeColor] = useState(COLORS[3]); // Blue
  const [showPenConfig, setShowPenConfig] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);

  /**
   * Selects a tool and closes any open menus
   * @param tool - Tool identifier to select
   */
  const selectTool = useCallback((tool: string) => {
    setActiveTool(tool);
    setShowPenConfig(false);
    setShowShapeMenu(false);
  }, []);

  return {
    activeTool,
    setActiveTool,
    penColor,
    setPenColor,
    penThickness,
    setPenThickness,
    selectedShapeColor,
    setSelectedShapeColor,
    showPenConfig,
    setShowPenConfig,
    showShapeMenu,
    setShowShapeMenu,
    selectTool,
  };
};
