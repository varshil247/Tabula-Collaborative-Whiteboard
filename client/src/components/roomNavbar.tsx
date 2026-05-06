import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../context/ThemeContext";
import { IoSunnyOutline, IoMoonOutline, IoLogOutOutline, IoExitOutline } from "react-icons/io5";
import { IoCopyOutline } from "react-icons/io5";
import { logoutUser } from "../redux/slices/userSlice";
import { clearRoomCode } from "../redux/slices/roomCodeSlice";
import { supabase } from "../backend/createClient";

const RoomNavbar: React.FC = () => {
  // 1. Safe destructuring for Theme
  const themeContext = useTheme();
  const theme = themeContext?.theme || "dark";
  const toggleTheme = themeContext?.toggleTheme || (() => {});

  // 2. Safe destructuring for User
  const { user } = useSelector((state: any) => state.user || {});

  // 3. SAFE Redux extraction for roomCode (Handles missing store, object store, or string store)
  const roomCodeState = useSelector((state: any) => state.roomCode);
  const roomCode =
    roomCodeState?.roomCode || (typeof roomCodeState === "string" ? roomCodeState : null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [roomTitle, setRoomTitle] = useState<string>("Loading...");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomCode) return;
      const { data, error } = await supabase
        .from("rooms")
        .select("title")
        .eq("id", roomCode)
        .single();

      if (data && !error) {
        setRoomTitle(data.title);
      }
    };
    fetchRoomDetails();
  }, [roomCode]);

  // Full logout: clears everything and returns to root
  const handleLogout = () => {
    dispatch(clearRoomCode());
    dispatch(logoutUser());
    navigate("/");
  };

  // Leave room: Keeps auth users logged in, kicks guests out
  const handleLeaveRoom = () => {
    dispatch(clearRoomCode());
    if (user?.type === "auth") {
      navigate("/dashboard");
    } else {
      dispatch(logoutUser());
      navigate("/");
    }
  };

  const getUserInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "U";
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const copyRoomCode = () => {
    if (roomCode) navigator.clipboard.writeText(roomCode);
  };

  const startEditing = () => {
    setEditName(roomTitle);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName("");
  };

  const saveRoomName = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName || trimmedName === roomTitle || !roomCode) {
      setIsEditing(false);
      return;
    }

    const previousTitle = roomTitle;
    setRoomTitle(trimmedName);
    setIsEditing(false);

    try {
      const { error } = await supabase
        .from("rooms")
        .update({
          title: trimmedName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomCode);

      if (error) throw error;
    } catch (err: any) {
      setRoomTitle(previousTitle);
      console.error("Failed to update title:", err.message);
    }
  };

  return (
    <nav className="flex w-full justify-center border-b border-border/50 bg-primary">
      {/* 
        Container matching the standard Navbar wrapper: 
        max-w-[1200px], consistent padding, horizontally aligned with main content.
      */}
      <div className="flex w-full items-center justify-between px-[var(--padding-1)] py-5 max-md:px-4">
        {/* Left Side: Logo and Editable Title */}
        <div className="flex items-center gap-3">
          <Link
            to={user?.type === "auth" ? "/dashboard" : "/room"}
            className="group flex items-center gap-2 text-2xl font-extrabold tracking-tight text-brand no-underline transition-all duration-200 ease-in hover:text-brand max-sm:text-xl"
            title="Back to Dashboard"
          >
            <div
              className="h-6 w-6 translate-y-[0px] bg-brand transition-colors duration-200 ease-in group-hover:bg-brand max-sm:h-5 max-sm:w-5"
              style={{
                WebkitMaskImage: 'url("/tabula_icon_black.png")',
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskImage: 'url("/tabula_icon_black.png")',
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
              }}
            ></div>
          </Link>

          {/* Editable Title Widget */}
          <div className="flex items-center max-w-[220px] max-md:max-w-[140px]">
            {isEditing ? (
              <input
                type="text"
                className="flex h-10 w-full items-center rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.2)] px-4 text-[0.95rem] font-semibold tracking-tight text-primary outline-none transition-all duration-200 ease-in"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={saveRoomName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveRoomName();
                  if (e.key === "Escape") cancelEditing();
                }}
                autoFocus
              />
            ) : (
              <button
                className="group flex h-10 w-full cursor-text items-center rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] px-4 text-left transition-all duration-200 ease-in hover:bg-[rgba(150,150,150,0.2)] active:scale-[0.98]"
                onClick={startEditing}
                title="Click to edit title"
              >
                <span className="truncate text-[0.95rem] font-semibold tracking-tight text-secondary transition-colors duration-200 group-hover:text-primary">
                  {roomTitle}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Code, Theme, Profile */}
        <div className="flex items-center gap-2 max-sm:gap-1">
          {/* Room Code Copy Widget */}
          {roomCode && (
            <button
              className="hidden md:flex h-10 cursor-pointer items-center gap-2 rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] px-4 text-left transition-all duration-200 hover:bg-[rgba(150,150,150,0.2)] hover:text-primary active:scale-[0.98]"
              onClick={copyRoomCode}
              title="Copy session code"
            >
              <IoCopyOutline className="shrink-0 text-secondary" size={16} />
              <span className="truncate font-mono text-[0.85rem] font-semibold tracking-wide text-secondary">
                {roomCode}
              </span>
            </button>
          )}

          <div className="hidden md:block mx-2 h-[28px] w-[1px] bg-[var(--border-color)]"></div>

          {/* Theme Toggle */}
          <button
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] text-secondary transition-all duration-200 ease-in hover:bg-[rgba(150,150,150,0.2)] hover:text-primary active:scale-95 max-sm:h-[2.1rem] max-sm:w-[2.1rem]"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <IoMoonOutline size={20} /> : <IoSunnyOutline size={20} />}
          </button>

          {/* User Dropdown */}
          {user && (
            <>
              <div className="mx-2 h-[28px] w-[1px] bg-[var(--border-color)]"></div>
              <div className="relative flex items-center" ref={dropdownRef}>
                <button
                  className="cursor-pointer rounded-[var(--border-radius-3)] border-none bg-transparent p-0 transition-transform duration-200 ease-in active:scale-95"
                  onClick={toggleDropdown}
                  aria-label="User menu"
                >
                  <div className="flex h-10 w-10 select-none items-center justify-center rounded-[var(--border-radius-1)] bg-[rgba(150,150,150,0.1)] text-xs font-extrabold uppercase tracking-wider text-secondary hover:bg-[rgba(150,150,150,0.2)] hover:text-primary max-sm:h-[2.1rem] max-sm:w-[2.1rem]">
                    {getUserInitials(user.user_email)}
                  </div>
                </button>
                {isDropdownOpen && (
                  <div className="animate-in fade-in zoom-in-95 absolute right-0 top-[calc(100%+0.5rem)] z-10 flex min-w-[180px] origin-top-right flex-col rounded-xl border border-border bg-secondary p-1 shadow-md duration-200">
                    <div className="cursor-default px-3 py-2">
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[0.85rem] font-medium text-secondary">
                        {user.user_email}
                      </span>
                    </div>

                    <div className="mx-1 my-1 h-[1px] bg-[rgba(150,150,150,0.2)]"></div>

                    {/* Show Code copy on mobile inside dropdown */}
                    {roomCode && (
                      <button
                        className="md:hidden flex w-full cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-3 py-2 text-left text-[0.85rem] font-medium text-primary transition-all duration-200 hover:bg-tertiary"
                        onClick={copyRoomCode}
                      >
                        <IoCopyOutline size={16} className="flex-shrink-0" />
                        <span className="font-mono">{roomCode}</span>
                      </button>
                    )}

                    <button
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-3 py-2 text-left text-[0.85rem] font-medium text-primary transition-all duration-200 hover:bg-danger/10 hover:text-danger"
                      onClick={handleLeaveRoom}
                    >
                      <IoExitOutline size={18} className="flex-shrink-0" />
                      <span className="-translate-y-[2px] leading-none">Leave room</span>
                    </button>

                    {user?.type === "auth" && (
                      <button
                        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-3 py-2 text-left text-[0.85rem] font-medium text-primary transition-all duration-200 hover:bg-danger/10 hover:text-danger"
                        onClick={handleLogout}
                      >
                        <IoLogOutOutline size={18} className="flex-shrink-0" />
                        <span className="-translate-y-[2px] leading-none">Logout</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default RoomNavbar;
