import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * Data structure for shapes stored on the canvas
 */
export type ShapeData = {
  uuid: string;
  shape: string;
  config: any;
  posX: number;
  posY: number;
  user: string;
  roomCode: string;
};

export interface CanvasState {
  shapes: ShapeData[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CanvasState = {
  shapes: [],
  isLoading: true,
  error: null,
};

/**
 * Slice for managing the canvas content and loading state
 */
const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    setCanvasState: (state, action: PayloadAction<ShapeData[]>) => {
      state.shapes = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCanvasLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCanvasError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearCanvas: (state) => {
      state.shapes = [];
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { setCanvasState, setCanvasLoading, setCanvasError, clearCanvas } =
  canvasSlice.actions;

export default canvasSlice.reducer;
