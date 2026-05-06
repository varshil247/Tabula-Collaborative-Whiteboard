/**
 * TypeScript type definitions for the application
 * Centralizes all type definitions for better maintainability
 */

/**
 * Canvas shape configuration object
 */
export interface ShapeConfig {
  // Common properties
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;

  // Pen-specific
  points?: number[];
  globalCompositeOperation?: string;

  // Rectangle/Image/Text
  width?: number;
  height?: number;

  // Circle/Star/Triangle/Hexagon
  radius?: number;
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;

  // Ellipse
  radiusX?: number;
  radiusY?: number;

  // Text
  text?: string;
  fontSize?: number;
  fontFamily?: string;

  // Image
  url?: string;
  storagePath?: string;
}

/**
 * Canvas shape object
 */
export interface Shape {
  uuid: string;
  shape: string; // "pen" | "rectangle" | "circle" | etc
  posX: number;
  posY: number;
  config: ShapeConfig;
  user?: string;
  roomCode?: string;
  timestamp?: number;
}

/**
 * User information
 */
export interface User {
  user_id: string;
  email: string;
  user?: {
    user_id: string;
    email: string;
  };
  type?: "auth" | "guest";
}

/**
 * Room data structure
 */
export interface Room {
  id: string;
  title: string;
  host_id: string;
  updated_at?: string;
  host_name?: string;
  thumbnail_url?: string;
  canvas_state?: Shape[];
  currentUserRole?: "host" | "guest";
}

/**
 * Drag state for canvas panning
 */
export interface DragState {
  dragX: number;
  dragY: number;
}

/**
 * Selection box for multi-select
 */
export interface SelectionBox {
  visible: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Content bounds for screenshot
 */
export interface ContentBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * History entry for undo/redo
 */
export interface HistoryEntry {
  type: string; // "CREATE" | "DELETE" | "MOVE" | etc
  uuid?: string;
  object?: Shape;
  uuids?: string[];
  objects?: Shape[];
  prevShape?: Shape;
  newShape?: Shape;
  prevPosition?: { x: number; y: number };
  newPosition?: { x: number; y: number };
  previousShapes?: Shape[];
  newShapes?: Shape[];
  prevText?: string;
  newText?: string;
  timestamp?: number;
}

/**
 * Pen configuration
 */
export interface PenConfig {
  color: string;
  thickness: number;
}

/**
 * Tool state configuration
 */
export interface ToolState {
  activeTool: string;
  penColor: string;
  penThickness: number;
  selectedShapeColor: string;
  showPenConfig: boolean;
  showShapeMenu: boolean;
}

/**
 * Socket event handlers
 */
export interface SocketHandlers {
  onCanvasState?: (state: Shape[]) => void;
  onCanvasUpdate?: (state: Shape[]) => void;
  onDrawing?: (line: Shape) => void;
  onObjectUpdate?: (object: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

/**
 * Drawing session state
 */
export interface DrawingSession {
  isActive: boolean;
  currentLine?: Shape;
  startTime?: number;
  pointCount?: number;
}

/**
 * Text editing session
 */
export interface TextEditingSession {
  isActive: boolean;
  shapeId?: string;
  originalText?: string;
  currentText?: string;
}

/**
 * Eraser operation result
 */
export interface EraserResult {
  updatedShapes: Shape[];
  pathsToDelete: string[];
  shapeModified: boolean;
}

/**
 * Point/Coordinate
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Rectangle bounds
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Zoom and pan state
 */
export interface ViewportState {
  scale: number;
  panX: number;
  panY: number;
}

/**
 * Remote user state
 */
export interface RemoteUser {
  id: string;
  name: string;
  cursor?: Point;
  isDrawing?: boolean;
  selectedColor?: string;
}

/**
 * Collaboration metadata
 */
export interface CollaborationMetadata {
  roomCode: string;
  userId: string;
  userName: string;
  joinedAt: number;
  lastActivityAt: number;
}
