import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * Data structure for a whiteboard room
 */
export type RoomData = {
  id: string;
  title: string;
  host_id: string;
  updated_at?: string;
  host_name?: string;
  currentUserRole: "host" | "guest";
  thumbnail_url?: string;
};

export interface RoomsState {
  hostedRooms: RoomData[];
  joinedRooms: RoomData[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RoomsState = {
  hostedRooms: [],
  joinedRooms: [],
  isLoading: true,
  error: null,
};

/**
 * Slice for managing the collection of rooms (hosted and joined)
 */
const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setRoomsData: (state, action: PayloadAction<{ hosted: RoomData[]; joined: RoomData[] }>) => {
      state.hostedRooms = action.payload.hosted;
      state.joinedRooms = action.payload.joined;
      state.isLoading = false;
      state.error = null;
    },
    addHostedRoom: (state, action: PayloadAction<RoomData>) => {
      state.hostedRooms.unshift(action.payload);
    },
    updateRoomTitle: (
      state,
      action: PayloadAction<{
        id: string;
        title: string;
        updated_at: string;
        isHost: boolean;
      }>,
    ) => {
      const list = action.payload.isHost ? state.hostedRooms : state.joinedRooms;
      const index = list.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        list[index].title = action.payload.title;
        list[index].updated_at = action.payload.updated_at;
        // Re-sort to show most recently updated room first
        list.sort(
          (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime(),
        );
      }
    },
    removeHostedRoom: (state, action: PayloadAction<string>) => {
      state.hostedRooms = state.hostedRooms.filter((r) => r.id !== action.payload);
    },
    removeJoinedRoom: (state, action: PayloadAction<string>) => {
      state.joinedRooms = state.joinedRooms.filter((r) => r.id !== action.payload);
    },
    clearRooms: (state) => {
      state.hostedRooms = [];
      state.joinedRooms = [];
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setRoomsData,
  addHostedRoom,
  updateRoomTitle,
  removeHostedRoom,
  removeJoinedRoom,
  clearRooms,
} = roomsSlice.actions;

export default roomsSlice.reducer;
