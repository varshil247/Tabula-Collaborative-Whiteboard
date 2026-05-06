import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * State for tracking current room session
 */
export interface RoomCodeState {
  roomCode: string | null;
}

const getRoomCodeFromStorage = (): string | null => {
  try {
    const storedCode = sessionStorage.getItem("RoomCode");
    return storedCode ? JSON.parse(storedCode) : null;
  } catch (error) {
    console.error("Failed to parse room code from storage:", error);
    return null;
  }
};

const initialState: RoomCodeState = {
  roomCode: getRoomCodeFromStorage(),
};

/**
 * Slice for managing the active room code
 * Persists to sessionStorage to survive refreshes while in a room
 */
export const roomCodeSlice = createSlice({
  name: "roomCode",
  initialState,
  reducers: {
    storeRoomCode: (state, action: PayloadAction<string>) => {
      state.roomCode = action.payload;
      sessionStorage.setItem("RoomCode", JSON.stringify(action.payload));
    },
    clearRoomCode: (state) => {
      state.roomCode = null;
      sessionStorage.removeItem("RoomCode");
    },
  },
});

export const { storeRoomCode, clearRoomCode } = roomCodeSlice.actions;
export default roomCodeSlice.reducer;
