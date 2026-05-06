import React, { useState, useCallback, useMemo } from "react";
import Navbar from "../components/navbar";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { supabase } from "../backend/createClient";
import { storeRoomCode } from "../redux/slices/roomCodeSlice";
import { loginUser } from "../redux/slices/userSlice";

// ------------------------------------------------------------------------------------------------
// Component
const Join: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Validation logic
  const isRoomCodeValid = useMemo(
    () => /^[a-zA-Z0-9_-]{0,8}$/.test(roomCode),
    [roomCode],
  );

  const isFormValid = useMemo(
    () =>
      username.trim() && /^[a-zA-Z0-9_-]{8}$/.test(roomCode) && isRoomCodeValid,
    [username, roomCode, isRoomCodeValid],
  );

  // Handlers
  const handleJoinRoom = useCallback(async () => {
    if (!isFormValid) {
      setErrorMessage("Please enter a valid 8-character code and display name");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("id")
        .eq("id", roomCode);

      if (error || !data || data.length === 0) {
        setErrorMessage("Room not found. Please check the code and try again.");
        setIsLoading(false);
      } else {
        // Log in as guest
        dispatch(loginUser({ 
          user_id: `guest_${Date.now()}`,
          user_email: username, 
          access_token: "",
          type: "guest" 
        }));
        dispatch(storeRoomCode(roomCode));
        navigate("/room");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred");
      setIsLoading(false);
    }
  }, [roomCode, username, isFormValid, dispatch, navigate]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && isFormValid) {
        handleJoinRoom();
      }
    },
    [isFormValid, handleJoinRoom],
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 max-sm:p-2 relative">
      <div className="w-full max-w-[400px] relative">
        <Navbar />

        <div className="bg-secondary rounded-2xl shadow-box p-10 max-sm:p-8 animate-in slide-in-from-bottom-5 duration-300 ease-out">
          <div className="text-center mb-9">
            <h1 className="text-2xl font-semibold text-primary opacity-90 m-0 mb-1 leading-[1.2]">
              Collaborate now
            </h1>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 relative group">
              <input
                id="roomCode"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyUp={handleKeyPress}
                placeholder=" "
                maxLength={8}
                className={`peer w-full px-4 py-3.5 border ${!isRoomCodeValid && roomCode ? "!border-danger" : "border-border"} rounded-xl bg-primary text-primary text-base font-medium tracking-tight transition-all duration-300 ease-in focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={isLoading}
              />
              <label
                htmlFor="roomCode"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-transparent px-1.5 text-secondary text-base font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none peer-focus:top-0 peer-focus:text-[0.7rem] peer-focus:text-brand peer-focus:font-bold peer-focus:bg-secondary peer-focus:rounded-[2px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[0.7rem] peer-[:not(:placeholder-shown)]:text-brand peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:bg-secondary peer-[:not(:placeholder-shown)]:rounded-[2px]"
              >
                Room code
              </label>
              {!isRoomCodeValid && roomCode && (
                <p className="text-[0.85rem] font-medium text-danger m-0 mt-1">
                  Code must be 8 characters
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 relative group">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyUp={handleKeyPress}
                placeholder=" "
                className="peer w-full px-4 py-3.5 border border-border rounded-xl bg-primary text-primary text-base font-medium tracking-tight transition-all duration-300 ease-in focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              />
              <label
                htmlFor="username"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-transparent px-1.5 text-secondary text-base font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none peer-focus:top-0 peer-focus:text-[0.7rem] peer-focus:text-brand peer-focus:font-bold peer-focus:bg-secondary peer-focus:rounded-[2px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[0.7rem] peer-[:not(:placeholder-shown)]:text-brand peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:bg-secondary peer-[:not(:placeholder-shown)]:rounded-[2px]"
              >
                Display name
              </label>
            </div>

            {errorMessage && (
              <div
                className="px-4 py-3.5 bg-[rgba(225,29,72,0.1)] border-l-4 border-l-[var(--color-danger)] rounded-lg text-danger text-sm font-medium"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <button
              className="w-full px-4 py-3.5 bg-brand text-white border-none rounded-xl text-base font-semibold tracking-tight cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-md hover:not(:disabled):-translate-y-[2px] hover:not(:disabled):shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleJoinRoom}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Joining..." : "Continue"}
            </button>

            <div className="h-[1px] bg-[var(--border-color)] border-none m-0" />

            <div className="text-center text-secondary text-sm font-medium">
              <p className="m-0">
                Want to create a room?{" "}
                <Link
                  to="/login"
                  className="text-brand font-semibold no-underline transition-colors duration-200 hover:text-brand-hover hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Join;
