/**
 * Utility functions for capturing and saving canvas screenshots
 * Handles temporary Konva stage creation for clean exports
 */

import Konva from "konva/lib/index";
import { calculateContentBounds } from "./canvasUtils";
import { CANVAS, SOCKET } from "./constants";

/**
 * Captures a high-quality screenshot of the current canvas content
 * @param shapes - Array of all shapes to include in the screenshot
 * @returns Promise resolving to a base64 data URL or null
 */
export const captureCanvasScreenshot = async (shapes: any[]): Promise<string | null> => {
  if (shapes.length === 0) return null;

  try {
    const bounds = calculateContentBounds(shapes);
    if (!bounds) return null;

    const padding = CANVAS.SCREENSHOT_PADDING;
    const width = bounds.maxX - bounds.minX + padding * 2;
    const height = bounds.maxY - bounds.minY + padding * 2;

    // Create temporary container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.visibility = "hidden";
    document.body.appendChild(container);

    try {
      // Create a temporary stage just for exporting
      const exportStage = new Konva.Stage({
        container,
        width,
        height,
      });

      const exportLayer = new Konva.Layer({
        x: -bounds.minX + padding,
        y: -bounds.minY + padding,
      });

      // Clone and render shapes onto export layer
      shapes.forEach((shape: any) => {
        let node: Konva.Node | null = null;
        const config = {
          ...shape.config,
          x: shape.posX,
          y: shape.posY,
          scaleX: shape.config.scaleX || 1,
          scaleY: shape.config.scaleY || 1,
          rotation: shape.config.rotation || 0,
        };

        switch (shape.shape) {
          case "pen":
            node = new Konva.Line({
              ...config,
              points: shape.config.points,
              stroke: shape.config.stroke,
              strokeWidth: shape.config.strokeWidth,
              globalCompositeOperation: shape.config.globalCompositeOperation || "source-over",
              tension: 0.5,
              lineCap: "round",
              lineJoin: "round",
            });
            break;
          case "rectangle":
            node = new Konva.Rect(config);
            break;
          case "circle":
            node = new Konva.Circle(config);
            break;
          case "text":
            node = new Konva.Text(config);
            break;
          case "ellipse":
            node = new Konva.Ellipse(config);
            break;
          case "star":
            node = new Konva.Star(config);
            break;
          case "triangle":
          case "hexagon":
            node = new Konva.RegularPolygon({
              ...config,
              sides: shape.shape === "triangle" ? 3 : 6,
            });
            break;
        }

        if (node) exportLayer.add(node);
      });

      exportStage.add(exportLayer);
      exportStage.draw();

      const dataUrl = exportStage.toDataURL({ pixelRatio: CANVAS.SCREENSHOT_PIXEL_RATIO });
      exportStage.destroy();

      return dataUrl;
    } finally {
      document.body.removeChild(container);
    }
  } catch (error) {
    console.error("Screenshot capture failed:", error);
    return null;
  }
};

/**
 * Saves a canvas screenshot as a room thumbnail via the backend
 * @param roomCode - The unique identifier for the room
 * @param shapes - Array of shapes to capture
 */
export const saveScreenshotToSupabase = async (roomCode: string | null, shapes: any[]) => {
  if (!roomCode || shapes.length === 0) return;

  try {
    const dataUrl = await captureCanvasScreenshot(shapes);
    if (!dataUrl) return;

    const response = await fetch(`${SOCKET.URL}/api/save-thumbnail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomCode, dataUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Server error saving thumbnail:", errorData.error || response.statusText);
      return;
    }

    const result = await response.json();
    if (!result.success) {
      console.error("Failed to save thumbnail via backend.");
    }
  } catch (error) {
    console.error("Screenshot save failed:", error);
  }
};
