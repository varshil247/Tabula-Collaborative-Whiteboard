/**
 * Socket.io communication utilities
 * Handles all real-time collaboration events and connections
 */

import { Socket } from "socket.io-client";
import { SOCKET } from "./constants";

/**
 * Emits a canvas update to the server
 * Broadcasts the entire canvas state to all users in the room
 * @param socket - Active socket connection
 * @param roomCode - Target room identifier
 * @param state - Complete canvas state (array of shapes)
 */
export const emitCanvasUpdate = (socket: Socket | null, roomCode: string, state: any[]) => {
  if (!roomCode || !socket) return;
  socket.emit(SOCKET.EVENTS.CANVAS_UPDATE, { roomCode, state });
};

/**
 * Emits real-time drawing stroke updates
 * Sent while pen is actively drawing to show stroke in progress
 * @param socket - Active socket connection
 * @param roomCode - Target room identifier
 * @param line - Current line/stroke object being drawn
 */
export const emitDrawingUpdate = (socket: Socket | null, roomCode: string, line: any) => {
  if (!roomCode || !socket || !line) return;
  socket.emit(SOCKET.EVENTS.DRAWING, { roomCode, line });
};

/**
 * Emits real-time object transformation updates
 * Sent while moving or transforming shapes to show live preview
 * @param socket - Active socket connection
 * @param roomCode - Target room identifier
 * @param object - Object with position/transform data
 */
export const emitObjectUpdate = (socket: Socket | null, roomCode: string, object: any) => {
  if (!roomCode || !socket || !object) return;
  socket.emit(SOCKET.EVENTS.OBJECT_UPDATE, { roomCode, object });
};

/**
 * Joins a room and requests initial canvas state
 * @param socket - Active socket connection
 * @param roomCode - Room code to join
 */
export const joinRoom = (socket: Socket | null, roomCode: string) => {
  if (!socket || !roomCode) return;
  socket.emit(SOCKET.EVENTS.JOIN_ROOM, roomCode);
};

/**
 * Socket event handler types for type safety
 */
export interface SocketHandlers {
  onCanvasState?: (state: any[]) => void;
  onCanvasUpdate?: (state: any[]) => void;
  onDrawing?: (line: any) => void;
  onObjectUpdate?: (object: any) => void;
  onCursorMove?: (data: any) => void;
  onUserDisconnect?: (userId: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

/**
 * Sets up all socket event listeners
 * @param socket - Active socket connection
 * @param handlers - Object containing handler functions for each event
 */
export const setupSocketListeners = (socket: Socket | null, handlers: SocketHandlers) => {
  if (!socket) return;

  if (handlers.onCanvasState) {
    socket.on(SOCKET.EVENTS.CANVAS_STATE, handlers.onCanvasState);
  }

  if (handlers.onCanvasUpdate) {
    socket.on(SOCKET.EVENTS.CANVAS_UPDATE, handlers.onCanvasUpdate);
  }

  if (handlers.onDrawing) {
    socket.on(SOCKET.EVENTS.DRAWING, handlers.onDrawing);
  }

  if (handlers.onObjectUpdate) {
    socket.on(SOCKET.EVENTS.OBJECT_UPDATE, handlers.onObjectUpdate);
  }

  if (handlers.onCursorMove) {
    socket.on("cursor_move", handlers.onCursorMove);
  }

  if (handlers.onUserDisconnect) {
    socket.on("user_disconnect", handlers.onUserDisconnect);
  }

  if (handlers.onConnect) {
    socket.on("connect", handlers.onConnect);
  }

  if (handlers.onDisconnect) {
    socket.on("disconnect", handlers.onDisconnect);
  }

  if (handlers.onError) {
    socket.on("connect_error", handlers.onError);
  }
};

/**
 * Removes all socket event listeners to prevent memory leaks
 * @param socket - Socket connection to clean up
 */
export const cleanupSocketListeners = (socket: Socket | null) => {
  if (!socket) return;
  socket.off(SOCKET.EVENTS.CANVAS_STATE);
  socket.off(SOCKET.EVENTS.CANVAS_UPDATE);
  socket.off(SOCKET.EVENTS.DRAWING);
  socket.off(SOCKET.EVENTS.OBJECT_UPDATE);
  socket.off("cursor_move");
  socket.off("user_disconnect");
  socket.off("connect");
  socket.off("disconnect");
  socket.off("connect_error");
};
