import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export const useThemeHook = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeHook must be used within ThemeProvider");
  }
  return context;
};

export default useThemeHook;