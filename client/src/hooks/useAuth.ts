import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { supabase } from "../backend/createClient";
import { loginUser } from "../redux/slices/userSlice";

/**
 * Custom hook for authentication logic
 * Handles login, registration, and logout
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Signs in a user with email and password
   */
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        setErrorMessage(error?.message || "Login failed");
        setIsLoading(false);
        return false;
      }

      if (data.session) {
        dispatch(
          loginUser({
            user_id: data.user.id,
            user_email: data.user.email,
            access_token: data.session.access_token,
            type: "auth",
          }),
        );
      }

      setIsLoading(false);
      navigate("/dashboard");
      return true;
    } catch (err) {
      setErrorMessage("An unexpected error occurred");
      setIsLoading(false);
      return false;
    }
  }, [dispatch, navigate]);

  /**
   * Registers a new user
   */
  const signUp = useCallback(async (email: string, password: string, username: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error || !data.user) {
        setErrorMessage(error?.message || "Registration failed");
        setIsLoading(false);
        return false;
      }

      if (data.session) {
        dispatch(
          loginUser({
            user_id: data.user.id,
            user_email: data.user.email,
            access_token: data.session.access_token,
            type: "auth",
          }),
        );
      }

      setIsLoading(false);
      navigate("/dashboard");
      return true;
    } catch (err) {
      setErrorMessage("An unexpected error occurred");
      setIsLoading(false);
      return false;
    }
  }, [dispatch, navigate]);

  /**
   * Logs out the current user
   */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // logoutUser action is typically dispatched in components using useDispatch
  }, []);

  return {
    signIn,
    signUp,
    signOut,
    isLoading,
    errorMessage,
    setErrorMessage,
  };
};
