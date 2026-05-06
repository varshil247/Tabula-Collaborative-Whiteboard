/**
 * Represents the state of the canvas, which is an array of objects/shapes.
 */
export type CanvasState = any[];

/**
 * Payload for updating the canvas state.
 */
export interface CanvasUpdatePayload {
  roomCode: string;
  state: CanvasState;
}

/**
 * Payload for real-time stroke drawing events.
 */
export interface DrawingPayload {
  roomCode: string;
  line: any;
}

/**
 * Payload for object manipulation events (e.g., resizing, moving).
 */
export interface ObjectUpdatePayload {
  roomCode: string;
  object: any;
}
