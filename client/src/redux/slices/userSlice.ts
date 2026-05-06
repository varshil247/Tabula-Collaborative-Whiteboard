import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * User data stored in Redux and LocalStorage
 */
export type UserData = {
  user_id: string;
  user_email: string;
  access_token: string;
  type: string;
};

export interface UserState {
  user: UserData | null;
}

const getUserFromStorage = (): UserData | null => {
  try {
    const storedUser = localStorage.getItem("User");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to parse user from storage:", error);
    return null;
  }
};

const initialState: UserState = {
  user: getUserFromStorage(),
};

/**
 * Slice for user authentication state
 */
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
      localStorage.setItem("User", JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem("User");
    },
  },
});

export const { loginUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
