/**
 * Canvas utility functions for calculations and transformations
 * Handles coordinate systems, bounds calculations, and geometric operations
 */

import { v4 as uuidv4 } from "uuid";
import { CANVAS, SELECTION, ERASER } from "./constants";

/**
 * Logic for calculating new shapes after an erase operation.
 * Handles line splitting for pen drawings and hit detection for shapes.
 * @param pos - Eraser position {x, y}
 * @param shapes - Current array of shapes
 * @returns Object containing updated shapes, modified flag, and paths of deleted images
 */
export const calculateErasedShapes = (
  pos: { x: number; y: number },
  shapes: any[],
) => {
  const eraserRadius = ERASER.RADIUS;
  let shapeModified = false;
  const updatedShapes: any[] = [];
  const pathsToDelete: string[] = [];

  shapes.forEach((shape: any) => {
    if (shape.shape === "pen") {
      const pts = shape.config.points;
      let currentSegment: number[] = [];
      const segments: number[][] = [];
      const scaleX = shape.config.scaleX || 1;
      const scaleY = shape.config.scaleY || 1;

      for (let i = 0; i < pts.length; i += 2) {
        const px = pts[i] * scaleX + shape.posX;
        const py = pts[i + 1] * scaleY + shape.posY;
        const dist = Math.sqrt((px - pos.x) ** 2 + (py - pos.y) ** 2);

        if (dist > eraserRadius) {
          currentSegment.push(pts[i], pts[i + 1]);
        } else if (currentSegment.length > 0) {
          segments.push(currentSegment);
          currentSegment = [];
        }
      }
      if (currentSegment.length > 0) segments.push(currentSegment);

      if (segments.length === 1 && segments[0].length === pts.length) {
        updatedShapes.push(shape);
      } else {
        shapeModified = true;
        segments.forEach((seg) => {
          if (seg.length >= 4) {
            updatedShapes.push({
              ...shape,
              uuid: uuidv4(),
              config: { ...shape.config, points: seg },
            });
          }
        });
      }
    } else {
      let isHit = false;
      const { posX, posY, config } = shape;
      const sx = config.scaleX || 1;
      const sy = config.scaleY || 1;

      if (["rectangle", "image", "text"].includes(shape.shape)) {
        const w = (config.width || 100) * sx;
        const h = (config.height || 100) * sy;
        const minX = Math.min(posX, posX + w);
        const maxX = Math.max(posX, posX + w);
        const minY = Math.min(posY, posY + h);
        const maxY = Math.max(posY, posY + h);
        isHit = pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
      } else {
        const r =
          (config.radius || config.outerRadius || config.radiusX || 30) *
          Math.max(Math.abs(sx), Math.abs(sy));
        const dist = Math.sqrt((posX - pos.x) ** 2 + (posY - pos.y) ** 2);
        isHit = dist < eraserRadius + r;
      }

      if (isHit) {
        shapeModified = true;
        if (shape.shape === "image" && shape.config.storagePath)
          pathsToDelete.push(shape.config.storagePath);
      } else {
        updatedShapes.push(shape);
      }
    }
  });

  return { updatedShapes, shapeModified, pathsToDelete };
};

/**
 * Calculates the bounding box of all shapes on the canvas
 * Used for determining the viewport when capturing screenshots
 * @param shapes - Array of shape objects with position and config
 * @returns Object with minX, maxX, minY, maxY or null if no shapes
 */
export const calculateContentBounds = (shapes: any[]) => {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  let hasContent = false;

  shapes.forEach((shape: any) => {
    const sx = Math.abs(shape.config.scaleX || 1);
    const sy = Math.abs(shape.config.scaleY || 1);

    if (shape.shape === "pen") {
      const pts = shape.config.points;
      for (let i = 0; i < pts.length; i += 2) {
        const px = pts[i] * sx + shape.posX;
        const py = pts[i + 1] * sy + shape.posY;
        minX = Math.min(minX, px);
        maxX = Math.max(maxX, px);
        minY = Math.min(minY, py);
        maxY = Math.max(maxY, py);
        hasContent = true;
      }
    } else {
      let w = 100,
        h = 100,
        offsetX = 0,
        offsetY = 0;

      if (["rectangle", "image", "text"].includes(shape.shape)) {
        w = (shape.config.width || 100) * sx;
        h = (shape.config.height || 100) * sy;
      } else if (["circle", "triangle", "hexagon", "star"].includes(shape.shape)) {
        const r = shape.config.radius || shape.config.outerRadius || 50;
        w = r * 2 * sx;
        h = r * 2 * sy;
        offsetX = w / 2;
        offsetY = h / 2;
      } else if (shape.shape === "ellipse") {
        w = (shape.config.radiusX || 50) * 2 * sx;
        h = (shape.config.radiusY || 50) * 2 * sy;
        offsetX = w / 2;
        offsetY = h / 2;
      }

      const left = shape.posX - offsetX;
      const right = left + w;
      const top = shape.posY - offsetY;
      const bottom = top + h;

      minX = Math.min(minX, left);
      maxX = Math.max(maxX, right);
      minY = Math.min(minY, top);
      maxY = Math.max(maxY, bottom);
      hasContent = true;
    }
  });

  return hasContent ? { minX, maxX, minY, maxY } : null;
};

/**
 * Detects shapes within a selection box using AABB collision detection
 * @param shapes - Array of shapes to check
 * @param box - Selection box with x, y, width, height
 * @param selectedShapeIds - Current array of selected shape IDs
 * @returns Array of shape IDs that intersect with the selection box
 */
export const getShapesInSelectionBox = (
  shapes: any[],
  box: { x: number; y: number; width: number; height: number },
  selectedShapeIds: string[],
): string[] => {
  return shapes
    .filter((shape: any) => {
      const sx = Math.abs(shape.config.scaleX || 1);
      const sy = Math.abs(shape.config.scaleY || 1);

      if (shape.shape === "pen") {
        const pts = shape.config.points;
        let minX = Infinity,
          maxX = -Infinity,
          minY = Infinity,
          maxY = -Infinity;

        for (let i = 0; i < pts.length; i += 2) {
          const px = pts[i] * sx + shape.posX;
          const py = pts[i + 1] * sy + shape.posY;
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }

        return !(
          maxX < box.x ||
          minX > box.x + box.width ||
          maxY < box.y ||
          minY > box.y + box.height
        );
      } else {
        let w = 100,
          h = 100,
          offsetX = 0,
          offsetY = 0;

        if (["rectangle", "image", "text"].includes(shape.shape)) {
          w = (shape.config.width || 100) * sx;
          h = (shape.config.height || 100) * sy;
        } else if (["circle", "triangle", "hexagon", "star"].includes(shape.shape)) {
          const r = shape.config.radius || shape.config.outerRadius || 50;
          w = r * 2 * sx;
          h = r * 2 * sy;
          offsetX = w / 2;
          offsetY = h / 2;
        } else if (shape.shape === "ellipse") {
          w = (shape.config.radiusX || 50) * 2 * sx;
          h = (shape.config.radiusY || 50) * 2 * sy;
          offsetX = w / 2;
          offsetY = h / 2;
        }

        const shapeLeft = shape.posX - offsetX;
        const shapeRight = shapeLeft + w;
        const shapeTop = shape.posY - offsetY;
        const shapeBottom = shapeTop + h;

        return !(
          shapeRight < box.x ||
          shapeLeft > box.x + box.width ||
          shapeBottom < box.y ||
          shapeTop > box.y + box.height
        );
      }
    })
    .map((s: any) => s.uuid);
};

/**
 * Calculates new zoom level based on scroll direction
 * @param currentScale - Current zoom level
 * @param deltaY - Scroll delta (negative = zoom in, positive = zoom out)
 * @returns New zoom level clamped between MIN_ZOOM and MAX_ZOOM
 */
export const calculateNewZoom = (currentScale: number, deltaY: number): number => {
  const newScale =
    deltaY > 0 ? currentScale / CANVAS.ZOOM_SCALE_FACTOR : currentScale * CANVAS.ZOOM_SCALE_FACTOR;
  return Math.max(CANVAS.MIN_ZOOM, Math.min(newScale, CANVAS.MAX_ZOOM));
};

/**
 * Calculates stage position after zoom to keep pointer position fixed
 * @param pointer - Current mouse position
 * @param oldScale - Previous zoom level
 * @param newScale - New zoom level
 * @param currentX - Current stage X position
 * @param currentY - Current stage Y position
 * @returns Object with new dragX and dragY
 */
export const calculateZoomPosition = (
  pointer: { x: number; y: number },
  oldScale: number,
  newScale: number,
  currentX: number,
  currentY: number,
) => {
  const mousePointTo = {
    x: (pointer.x - currentX) / oldScale,
    y: (pointer.y - currentY) / oldScale,
  };

  return {
    dragX: pointer.x - mousePointTo.x * newScale,
    dragY: pointer.y - mousePointTo.y * newScale,
  };
};

/**
 * Converts minimap click position to stage pan coordinates
 * @param clickX - Click X relative to minimap
 * @param clickY - Click Y relative to minimap
 * @param boardWidth - Canvas board width
 * @param boardHeight - Canvas board height
 * @param stageScale - Current zoom level
 * @returns Object with dragX and dragY for new viewport
 */
export const convertMinimapClickToStagePos = (
  clickX: number,
  clickY: number,
  boardWidth: number,
  boardHeight: number,
  stageScale: number,
) => {
  const vWidth = (boardWidth / stageScale) * CANVAS.MINIMAP_SCALE;
  const vHeight = (boardHeight / stageScale) * CANVAS.MINIMAP_SCALE;
  const targetViewportX = clickX - vWidth / 2;
  const targetViewportY = clickY - vHeight / 2;

  return {
    dragX: -((targetViewportX - CANVAS.MINIMAP_CENTER_X) / CANVAS.MINIMAP_SCALE) * stageScale,
    dragY: -((targetViewportY - CANVAS.MINIMAP_CENTER_Y) / CANVAS.MINIMAP_SCALE) * stageScale,
  };
};

/**
 * Checks if a point is close to shapes for hit detection
 * Useful for selecting or hovering near objects
 * @param point - Point to check
 * @param shape - Shape to check against
 * @param threshold - Distance threshold for detection
 * @returns boolean indicating if point is near shape
 */
export const isPointNearShape = (
  point: { x: number; y: number },
  shape: any,
  threshold: number = 10,
): boolean => {
  const sx = Math.abs(shape.config.scaleX || 1);
  const sy = Math.abs(shape.config.scaleY || 1);

  if (
    shape.shape === "circle" ||
    shape.shape === "triangle" ||
    shape.shape === "hexagon" ||
    shape.shape === "star"
  ) {
    const r = shape.config.radius || shape.config.outerRadius || 50;
    const dist = Math.sqrt((shape.posX - point.x) ** 2 + (shape.posY - point.y) ** 2);
    return dist < r * Math.max(sx, sy) + threshold;
  }

  if (shape.shape === "rectangle" || shape.shape === "image" || shape.shape === "text") {
    const w = (shape.config.width || 100) * sx;
    const h = (shape.config.height || 100) * sy;
    const left = shape.posX - threshold;
    const right = shape.posX + w + threshold;
    const top = shape.posY - threshold;
    const bottom = shape.posY + h + threshold;
    return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
  }

  if (shape.shape === "ellipse") {
    const rx = (shape.config.radiusX || 50) * sx;
    const ry = (shape.config.radiusY || 50) * sy;
    const dx = Math.abs(point.x - shape.posX);
    const dy = Math.abs(point.y - shape.posY);
    return Math.pow(dx / rx, 2) + Math.pow(dy / ry, 2) <= 1 + threshold / Math.max(rx, ry);
  }

  return false;
};
