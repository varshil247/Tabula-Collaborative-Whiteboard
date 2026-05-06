import { describe, it, expect } from "vitest";
import { calculateNewZoom, calculateZoomPosition, calculateContentBounds } from "./canvasUtils";

describe("Canvas Utilities", () => {
  describe("calculateNewZoom", () => {
    it("should zoom in when deltaY is negative", () => {
      const currentScale = 1;
      const deltaY = -100;
      const newScale = calculateNewZoom(currentScale, deltaY);
      expect(newScale).toBeGreaterThan(currentScale);
    });

    it("should zoom out when deltaY is positive", () => {
      const currentScale = 1;
      const deltaY = 100;
      const newScale = calculateNewZoom(currentScale, deltaY);
      expect(newScale).toBeLessThan(currentScale);
    });

    it("should clamp zoom within MIN and MAX bounds", () => {
      expect(calculateNewZoom(0.1, 100)).toBe(0.1);
      expect(calculateNewZoom(5, -100)).toBe(5);
    });
  });

  describe("calculateZoomPosition", () => {
    it("should maintain fixed point on zoom", () => {
      const pointer = { x: 500, y: 500 };
      const oldScale = 1;
      const newScale = 2;
      const currentX = 0;
      const currentY = 0;
      
      const { dragX, dragY } = calculateZoomPosition(pointer, oldScale, newScale, currentX, currentY);
      
      // Fixed point formula: pointer.x - ((pointer.x - currentX) / oldScale) * newScale
      // 500 - (500 / 1) * 2 = -500
      expect(dragX).toBe(-500);
      expect(dragY).toBe(-500);
    });
  });

  describe("calculateContentBounds", () => {
    it("should return null for empty shapes", () => {
      expect(calculateContentBounds([])).toBeNull();
    });

    it("should calculate bounds for a single rectangle", () => {
      const shapes = [
        {
          shape: "rectangle",
          posX: 10,
          posY: 10,
          config: { width: 100, height: 100, scaleX: 1, scaleY: 1 }
        }
      ];
      const bounds = calculateContentBounds(shapes);
      expect(bounds).toEqual({ minX: 10, maxX: 110, minY: 10, maxY: 110 });
    });
  });
});
