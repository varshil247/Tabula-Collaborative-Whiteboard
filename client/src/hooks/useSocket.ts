/**
 * Custom hook for managing WebSocket connections and real-time collaboration
 * Handles socket initialization, listeners, and cleanup
 */

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET } from "../utils/constants";
import { setupSocketListeners, cleanupSocketListeners } from "../utils/socketUtils";

interface UseSocketOptions {
  roomCode: string | null;
  onCanvasState?: (state: any[]) => void;
  onCanvasUpdate?: (state: any[]) => void;
  onDrawing?: (line: any) => void;
  onObjectUpdate?: (object: any) => void;
  onCursorMove?: (cursor: { userId: string; x: number; y: number; userName: string }) => void;
  onUserDisconnect?: (userId: string) => void;
}

/**
 * Hook for managing WebSocket connection and real-time collaboration
 * Automatically connects/disconnects based on roomCode
 * @param options - Configuration object
 * @returns Object with socket reference and emit functions
 */
export const useSocket = (options: UseSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  
  // Use a ref for all options to avoid re-triggering the connection effect
  const optionsRef = useRef(options);
  
  // Keep options ref up to date on every render
  useEffect(() => {
    optionsRef.current = options;
  });

  // Initialize socket connection and setup listeners
  useEffect(() => {
    if (!options.roomCode) return;

    // Create socket connection
    const socket = io(SOCKET.URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    // Join the specific room
    socket.emit("join_room", options.roomCode);

    // Setup all event listeners using the current callbacks via optionsRef
    setupSocketListeners(socket, {
      onCanvasState: (state) => optionsRef.current.onCanvasState?.(state),
      onCanvasUpdate: (state) => optionsRef.current.onCanvasUpdate?.(state),
      onDrawing: (line) => optionsRef.current.onDrawing?.(line),
      onObjectUpdate: (object) => optionsRef.current.onObjectUpdate?.(object),
      onCursorMove: (data) => optionsRef.current.onCursorMove?.(data),
      onUserDisconnect: (userId) => optionsRef.current.onUserDisconnect?.(userId),
    });

    // Cleanup on unmount or room change
    return () => {
      cleanupSocketListeners(socket);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [options.roomCode]); // ONLY depend on roomCode

  /**
   * Broadcasts the full canvas state to all other clients
   */
  const emitCanvasUpdate = useCallback(
    (updatedShapes: any[]) => {
      if (!options.roomCode || !socketRef.current) return;
      socketRef.current.emit("canvas_update", { roomCode: options.roomCode, state: updatedShapes });
    },
    [options.roomCode],
  );

  /**
   * Broadcasts a single drawing line update
   */
  const emitDrawing = useCallback(
    (line: any) => {
      if (!options.roomCode || !socketRef.current) return;
      socketRef.current.emit("drawing", { roomCode: options.roomCode, line });
    },
    [options.roomCode],
  );

  /**
   * Broadcasts an object transformation (move, resize, rotate)
   */
  const emitObjectUpdate = useCallback(
    (object: any) => {
      if (!options.roomCode || !socketRef.current) return;
      socketRef.current.emit("object_update", { roomCode: options.roomCode, object });
    },
    [options.roomCode],
  );

  /**
   * Broadcasts cursor position
   */
  const emitCursorMove = useCallback(
    (cursor: { x: number; y: number; userName: string }) => {
      if (!options.roomCode || !socketRef.current) return;
      socketRef.current.emit("cursor_move", { roomCode: options.roomCode, ...cursor });
    },
    [options.roomCode],
  );

  return {
    socketRef,
    emitCanvasUpdate,
    emitDrawing,
    emitObjectUpdate,
    emitCursorMove,
  };
};
