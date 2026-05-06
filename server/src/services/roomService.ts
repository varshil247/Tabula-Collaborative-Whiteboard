import { supabase } from "./supabase";
import { CanvasState } from "../types";

/**
 * Service for managing in-memory and persistent room states
 * Implements a write-behind cache strategy to optimize database performance
 */

// In-memory store for room canvas states to minimize database reads
const roomStates: Map<string, CanvasState> = new Map();

// Set of room codes that have unsaved changes (dirty cache)
const dirtyRooms: Set<string> = new Set();

// Interval for batch saving dirty rooms to the database
const SAVE_INTERVAL_MS = 60 * 1000; // 1 minute

/**
 * Retrieves the current state of a room.
 * Fetches from Supabase if not already loaded in memory.
 * 
 * @param roomCode - The unique identifier of the room.
 * @returns A promise that resolves to the canvas state for the room.
 */
export const getRoomState = async (roomCode: string): Promise<CanvasState> => {
  // Return cached state if available
  if (roomStates.has(roomCode)) {
    return roomStates.get(roomCode) || [];
  }

  try {
    // Fetch from Supabase
    const { data, error } = await supabase
      .from("rooms")
      .select("canvas_state")
      .eq("id", roomCode)
      .single();

    if (error) {
      // If room doesn't exist or other DB error, initialize as empty
      console.warn(`Room ${roomCode} not found or error, initializing empty state.`);
      roomStates.set(roomCode, []);
      return [];
    }

    const initialState: CanvasState = data?.canvas_state || [];
    roomStates.set(roomCode, initialState);
    return initialState;
  } catch (err: any) {
    console.error(`Error fetching room ${roomCode}:`, err.message);
    // Return empty state as fallback
    const fallback: CanvasState = [];
    roomStates.set(roomCode, fallback);
    return fallback;
  }
};

/**
 * Updates the state of a room in memory and marks it as dirty for the batch saving process.
 * 
 * @param roomCode - The unique identifier of the room.
 * @param state - The updated canvas state.
 */
export const updateRoomState = (roomCode: string, state: CanvasState): void => {
  roomStates.set(roomCode, state);
  dirtyRooms.add(roomCode);
};

/**
 * Starts the periodic job to save dirty rooms to Supabase.
 * Runs on a fixed interval to batch database writes and optimize performance.
 */
export const startBatchSaveJob = (): void => {
  console.log("🛠️  Batch save job initialized.");

  setInterval(async () => {
    if (dirtyRooms.size === 0) {
      return;
    }

    const count = dirtyRooms.size;
    console.log(`💾 Saving ${count} active rooms to database...`);
    
    // Snapshot the currently dirty rooms to process them
    const roomsToSave = Array.from(dirtyRooms);
    dirtyRooms.clear();

    for (const roomCode of roomsToSave) {
      const state = roomStates.get(roomCode);
      if (!state) continue;

      try {
        const { error } = await supabase
          .from("rooms")
          .update({
            canvas_state: state,
            updated_at: new Date().toISOString(),
          })
          .eq("id", roomCode);

        if (error) throw error;
        
        console.log(`✅ Saved: ${roomCode}`);
      } catch (err: any) {
        console.error(`❌ Failed to save ${roomCode}:`, err.message);
        // Re-add to dirtyRooms so it will be retried on the next tick
        dirtyRooms.add(roomCode);
      }
    }
  }, SAVE_INTERVAL_MS);
};

/**
 * Force saves all dirty rooms (useful during server shutdown)
 */
export const flushAllRooms = async (): Promise<void> => {
  if (dirtyRooms.size === 0) return;

  const roomsToSave = Array.from(dirtyRooms);
  dirtyRooms.clear();

  for (const roomCode of roomsToSave) {
    const state = roomStates.get(roomCode);
    if (!state) continue;

    try {
      await supabase
        .from("rooms")
        .update({
          canvas_state: state,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomCode);
    } catch (err) {
      console.error(`Emergency save failed for ${roomCode}`);
    }
  }
};
