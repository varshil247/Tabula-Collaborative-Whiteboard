import { Server, Socket } from "socket.io";
import { getRoomState, updateRoomState } from "../services/roomService";
import { CanvasUpdatePayload, DrawingPayload, ObjectUpdatePayload } from "../types";

/**
 * Initializes socket.io event handlers for real-time collaboration.
 * Manages room joining, state synchronization, and live event broadcasting.
 * 
 * @param io - The Socket.io server instance.
 */
export const setupSocketHandlers = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    /**
     * Join Room & Sync Initial State
     * Client requests to join a specific room, gets current canvas state in response.
     */
    socket.on("join_room", async (roomCode: string) => {
      if (!roomCode) return;
      
      socket.join(roomCode);
      console.log(`👤 User ${socket.id} joined room: ${roomCode}`);

      // Fetch latest state (cached or from DB)
      const state = await getRoomState(roomCode);
      socket.emit("canvas_state", state);
    });

    /**
     * Persist Canvas State Updates
     * Receives finalized state updates, updates the write-behind cache,
     * and broadcasts the new state to all other clients in the room.
     */
    socket.on("canvas_update", ({ roomCode, state }: CanvasUpdatePayload) => {
      if (!roomCode || !state) return;

      // Update in-memory state and mark as dirty for batch saving
      updateRoomState(roomCode, state);
      
      // Broadcast to others in the same room
      socket.to(roomCode).emit("canvas_update", state);
    });

    /**
     * Real-time Pen Drawing
     * Broadcasts active pen strokes to peers for immediate low-latency feedback.
     */
    socket.on("drawing", ({ roomCode, line }: DrawingPayload) => {
      if (!roomCode || !line) return;

      // Append user ID to stroke for peer tracking
      socket.to(roomCode).emit("drawing", { ...line, userId: socket.id });
    });

    /**
     * Real-time Object Transformation
     * Broadcasts live updates for moving, resizing, or rotating objects.
     */
    socket.on("object_update", ({ roomCode, object }: ObjectUpdatePayload) => {
      if (!roomCode || !object) return;

      socket.to(roomCode).emit("object_update", object);
    });

    /**
     * Real-time Cursor Movement
     */
    socket.on("cursor_move", ({ roomCode, ...cursorData }: any) => {
      if (!roomCode) return;
      socket.to(roomCode).emit("cursor_move", { userId: socket.id, ...cursorData });
    });

    /**
     * Client Disconnection
     */
    socket.on("disconnecting", () => {
      // Notify all rooms the user was in
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.to(room).emit("user_disconnect", socket.id);
        }
      });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};
