/**
 * Application-wide constants
 * Centralizes configuration values used throughout the app
 */

// Canvas configuration
export const CANVAS = {
  MINIMAP_SCALE: 0.04,
  MINIMAP_WIDTH: 140,
  MINIMAP_HEIGHT: 90,
  MINIMAP_CENTER_X: 70,
  MINIMAP_CENTER_Y: 45,
  ZOOM_SCALE_FACTOR: 1.1,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5,
  GRID_SIZE: 24,
  SCREENSHOT_PADDING: 40,
  SCREENSHOT_PIXEL_RATIO: 2,
} as const;

// Tool identifiers
export const TOOLS = {
  SELECT: "select",
  PEN: "pen",
  ERASER: "eraser",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  ELLIPSE: "ellipse",
  STAR: "star",
  TRIANGLE: "triangle",
  HEXAGON: "hexagon",
  TEXT: "text",
} as const;

export const SHAPE_TOOLS = [
  TOOLS.RECTANGLE,
  TOOLS.CIRCLE,
  TOOLS.ELLIPSE,
  TOOLS.STAR,
  TOOLS.TRIANGLE,
  TOOLS.HEXAGON,
  TOOLS.TEXT,
] as const;

// Shape names
export const SHAPES = {
  PEN: "pen",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  ELLIPSE: "ellipse",
  STAR: "star",
  TRIANGLE: "triangle",
  HEXAGON: "hexagon",
  TEXT: "text",
  IMAGE: "image",
} as const;

// Colors
export const COLORS = [
  "#000000", // Black
  "#ffffff", // White
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#a855f7", // Purple
] as const;

// WebSocket configuration
export const SOCKET = {
  URL: import.meta.env.VITE_SERVER_URL || "http://localhost:3000",
  EVENTS: {
    JOIN_ROOM: "join_room",
    CANVAS_STATE: "canvas_state",
    CANVAS_UPDATE: "canvas_update",
    DRAWING: "drawing",
    OBJECT_UPDATE: "object_update",
  },
} as const;

// Eraser configuration
export const ERASER = {
  RADIUS: 15,
  COLOR: "#ef4444",
  OPACITY: 0.2,
} as const;

// Selection styling
export const SELECTION = {
  STROKE_COLOR: "#3b82f6",
  STROKE_WIDTH: 2,
  SHADOW_COLOR: "#3b82f6",
  SHADOW_BLUR: 10,
  SHADOW_OPACITY: 0.5,
  MIN_BOX_SIZE: 5,
} as const;

// Text defaults
export const TEXT_DEFAULTS = {
  FONT_SIZE: 28,
  FONT_FAMILY: "sans-serif",
  PLACEHOLDER: "Double click to edit",
} as const;

// Shape defaults
export const SHAPE_DEFAULTS = {
  RECTANGLE: { width: 100, height: 100 },
  CIRCLE: { radius: 50 },
  ELLIPSE: { radiusX: 60, radiusY: 40 },
  STAR: { numPoints: 5, innerRadius: 25, outerRadius: 50 },
  TRIANGLE: { numPoints: 3, innerRadius: 25, outerRadius: 50 },
  HEXAGON: { numPoints: 6, innerRadius: 40, outerRadius: 50 },
} as const;

// Animation durations
export const ANIMATION = {
  DURATION_SHORT: 200,
  DURATION_MEDIUM: 500,
  DURATION_LONG: 1000,
} as const;

// File upload
export const FILE_UPLOAD = {
  ACCEPTED_FORMATS: "image/*",
  STORAGE_BUCKET: "canvas-images",
  THUMBNAIL_FILENAME: "thumbnail.png",
} as const;

// History types for undo/redo
export const HISTORY_TYPES = {
  CREATE: "CREATE",
  DRAW: "DRAW",
  TRANSFORM: "TRANSFORM",
  MOVE: "MOVE",
  DELETE: "DELETE",
  DELETE_MULTI: "DELETE_MULTI",
  ERASE_BATCH: "ERASE_BATCH",
  EDIT: "EDIT",
  CLEAR: "CLEAR",
} as const;
