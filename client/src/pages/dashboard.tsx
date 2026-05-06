import React, { useEffect, useState, useCallback, useRef } from "react";
import Navbar from "../components/navbar";
import { IoAddOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Hooks & Redux
import { useDashboardRooms } from "../hooks";
import { storeRoomCode } from "../redux/slices/roomCodeSlice";
import { setError as setErrorAction, type RoomData } from "../redux/slices/roomsSlice";

// Components
import { RoomCard } from "../components/dashboard/RoomCard";

/**
 * Main Dashboard page showing user's workspace
 * Integrates room management logic via useDashboardRooms hook
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Room Management Hook
  const {
    hostedRooms,
    joinedRooms,
    isLoading,
    error,
    retrieveRoomsData,
    createRoom,
    joinRoom,
    updateRoomTitle,
    deleteRoom,
    leaveRoom,
  } = useDashboardRooms();

  const { user } = useSelector((state: any) => state.user);
  const userId = user?.user_id || user?.user?.user_id;

  // Local UI State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [isJoinOpen, setIsJoinOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [joinCode, setJoinCode] = useState<string>("");
  const [newRoomTitle, setNewRoomTitle] = useState<string>("");

  const joinDropdownRef = useRef<HTMLDivElement>(null);
  const createDropdownRef = useRef<HTMLDivElement>(null);

  // Initial Data Load
  useEffect(() => {
    retrieveRoomsData();
  }, [retrieveRoomsData]);

  // Handle clicking outside to collapse the expanded inputs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (joinDropdownRef.current && !joinDropdownRef.current.contains(event.target as Node)) {
        setIsJoinOpen(false);
      }
      if (createDropdownRef.current && !createDropdownRef.current.contains(event.target as Node)) {
        setIsCreateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---

  const handleJoinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = joinCode.trim();
    if (!code) return;

    const joinedCode = await joinRoom(code);
    if (joinedCode) {
      dispatch(storeRoomCode(joinedCode));
      navigate("/room");
    }
  };

  const handleCreateSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const createdCode = await createRoom(newRoomTitle);
    if (createdCode) {
      setIsCreateOpen(false);
      setNewRoomTitle("");
    }
  };

  const saveRoomName = async (roomToEdit: RoomData) => {
    await updateRoomTitle(roomToEdit, editName);
    setEditingId(null);
  };

  const openRoom = (roomId: string) => {
    dispatch(storeRoomCode(roomId));
    navigate("/room");
  };

  const startEditing = (room: RoomData) => {
    setEditingId(room.id);
    setEditName(room.title);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm("Are you sure you want to completely delete this room?")) {
      await deleteRoom(roomId);
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    if (window.confirm("Are you sure you want to leave this room?")) {
      await leaveRoom(roomId);
    }
  };

  // --- Render Helpers ---

  const renderRoomsGrid = (roomList: RoomData[], isHost: boolean) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 max-md:grid-cols-1">
      {roomList.map((room) => (
        <div
          key={room.id}
          className="group relative flex flex-col overflow-hidden rounded-[var(--border-radius-2)] border border-border/40 bg-secondary p-0 shadow-sm transition-all duration-300 hover:border-gray-400/50 dark:hover:border-gray-600/50"
        >
          <RoomCard
            room={room}
            isEditing={editingId === room.id}
            editName={editName}
            isHost={isHost}
            onEditChange={setEditName}
            onSave={saveRoomName}
            onCancel={() => setEditingId(null)}
            onStartEdit={startEditing}
            onJoin={openRoom}
            onCopy={(id) => navigator.clipboard.writeText(id)}
            onDelete={handleDeleteRoom}
            onLeave={handleLeaveRoom}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-primary font-sans">
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] flex-1 p-[var(--padding-1)] pt-28 max-md:p-5 max-md:pt-24 pb-20">
        {/* Header & Controls */}
        <div className="mb-12 flex items-center justify-between border-b border-border/50 pb-6 max-md:mb-8 max-md:flex-col max-md:items-stretch max-md:gap-4">
          <h2 className="m-0 text-xl font-semibold leading-none tracking-tight text-primary/90 max-md:text-center max-md:text-[1.75rem]">
            Your workspace
          </h2>

          <div className="flex gap-3 max-md:flex-col items-center justify-end w-full md:w-auto">
            {/* Join Room - Expandable Pill */}
            <div
              ref={joinDropdownRef}
              className={`relative flex h-10 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isJoinOpen ? "w-[240px] max-md:w-full" : "w-[120px] max-md:w-full"
              }`}
            >
              {!isJoinOpen ? (
                <button
                  className="flex h-full w-full select-none cursor-pointer items-center justify-center gap-2 rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] px-4 text-[0.95rem] font-semibold text-secondary transition-all duration-200 ease-in hover:bg-[rgba(150,150,150,0.2)] hover:text-primary active:scale-95"
                  onClick={() => {
                    setIsJoinOpen(true);
                    setIsCreateOpen(false);
                  }}
                >
                  Join room
                </button>
              ) : (
                <form
                  onSubmit={handleJoinSubmit}
                  className="flex h-full w-full items-center gap-1.5 rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] p-1 shadow-sm transition-all focus-within:ring-2 focus-within:ring-brand/20 animate-in fade-in duration-200"
                >
                  <input
                    type="text"
                    placeholder="Room code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    autoFocus
                    className="w-full min-w-0 bg-transparent px-2 py-1 text-[0.9rem] font-medium text-primary outline-none disabled:opacity-50"
                    maxLength={8}
                  />
                  <button
                    type="submit"
                    disabled={!joinCode.trim()}
                    className="flex h-full shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md bg-secondary border-none px-3 text-[0.85rem] font-semibold text-primary transition-all hover:bg-[rgba(150,150,150,0.1)] hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>

            <div className="hidden md:block h-6 w-[1px] bg-border/60 transition-all duration-300"></div>

            {/* Create Room - Expandable Pill */}
            <div
              ref={createDropdownRef}
              className={`relative flex h-10 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isCreateOpen ? "w-[280px] max-md:w-full" : "w-[140px] max-md:w-full"
              }`}
            >
              {!isCreateOpen ? (
                <button
                  className="flex h-full w-full select-none cursor-pointer items-center justify-center gap-2 rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] px-4 text-[0.95rem] font-semibold text-secondary transition-all duration-200 ease-in hover:bg-[rgba(150,150,150,0.2)] hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => {
                    if (userId) {
                      setIsCreateOpen(true);
                      setIsJoinOpen(false);
                    }
                  }}
                  disabled={!userId}
                >
                  Create new
                </button>
              ) : (
                <form
                  onSubmit={handleCreateSubmit}
                  className="flex h-full w-full items-center gap-1.5 rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] p-1 shadow-sm transition-all focus-within:ring-2 focus-within:ring-brand/20 animate-in fade-in duration-200"
                >
                  <input
                    type="text"
                    placeholder="Room title (optional)"
                    value={newRoomTitle}
                    onChange={(e) => setNewRoomTitle(e.target.value)}
                    autoFocus
                    className="w-full min-w-0 bg-transparent px-2 py-1 text-[0.9rem] font-medium text-primary outline-none disabled:opacity-50"
                    maxLength={32}
                  />
                  <button
                    type="submit"
                    className="flex h-full shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md bg-secondary border-none px-3 text-[0.85rem] font-bold text-brand transition-all hover:bg-[rgba(150,150,150,0.1)] hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Create
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Global Errors */}
        {error && (
          <div className="mb-8 flex items-center justify-between rounded-lg border border-l-4 border-danger border-l-danger bg-danger/10 px-5 py-4 text-[0.95rem] font-medium text-danger">
            <span>{error}</span>
            <button
              className="cursor-pointer border-none bg-transparent p-0 text-2xl leading-none text-danger opacity-70 transition-opacity duration-200 hover:opacity-100"
              onClick={() => dispatch(setErrorAction(null))}
            >
              &times;
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-5 font-medium text-secondary">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-brand"></div>
            <p>Loading your workspace...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12 max-md:gap-8">
            {/* Empty State (No rooms at all) */}
            {hostedRooms.length === 0 && joinedRooms.length === 0 && (
              <button
                onClick={() => {
                  setIsCreateOpen(true);
                  setIsJoinOpen(false);
                }}
                className="group flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-none bg-[rgba(150,150,150,0.05)] px-8 py-16 text-center transition-all duration-200 ease-in hover:bg-[rgba(150,150,150,0.1)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="mb-4 flex justify-center text-[2.5rem] text-secondary transition-colors duration-200 group-hover:text-primary">
                  <IoAddOutline />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-primary">No rooms yet</h3>
                <p className="m-0 text-[0.95rem] font-medium text-secondary">
                  Create a new room or join an existing one to collaborate.
                </p>
              </button>
            )}

            {/* Hosted Rooms Section */}
            {hostedRooms.length > 0 && (
              <section className="max-md:pb-8 last:border-none last:pb-0">
                <h3 className="mb-6 text-lg font-semibold tracking-tight text-primary/90 max-md:mb-4">
                  Hosted rooms
                </h3>
                {renderRoomsGrid(hostedRooms, true)}
              </section>
            )}

            {/* Joined Rooms Section */}
            {joinedRooms.length > 0 && (
              <section className="max-md:pb-8 last:border-none last:pb-0">
                <h3 className="mb-6 text-lg font-semibold tracking-tight text-primary/90 max-md:mb-4">
                  Joined rooms
                </h3>
                {renderRoomsGrid(joinedRooms, false)}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
