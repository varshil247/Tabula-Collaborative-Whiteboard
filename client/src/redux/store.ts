import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import roomsReducer from "./slices/roomsSlice";
import roomCodeReducer from "./slices/roomCodeSlice";
import canvasReducer from "./slices/canvasSlice";

/**
 * Redux store configuration
 * Combines all feature slices and exports the root state and dispatch types
 */
export const store = configureStore({
  reducer: {
    user: userReducer,
    rooms: roomsReducer,
    roomCode: roomCodeReducer,
    canvas: canvasReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
