import React from "react";
import {
  IoTrashOutline,
  IoCopyOutline,
  IoArrowForwardOutline,
  IoPencilOutline,
  IoTextOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import type { RoomData } from "../redux/slices/roomsSlice";

interface RoomCardProps {
  room: RoomData;
  isEditing: boolean;
  editName: string;
  isHost: boolean;
  onEditChange: (val: string) => void;
  onSave: (room: RoomData) => void;
  onCancel: () => void;
  onStartEdit: (room: RoomData) => void;
  onJoin: (id: string) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onLeave: (id: string) => void;
}

/**
 * Component for displaying a single room in the dashboard grid
 */
export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isEditing,
  editName,
  isHost,
  onEditChange,
  onSave,
  onCancel,
  onStartEdit,
  onJoin,
  onCopy,
  onDelete,
  onLeave,
}) => {
  return (
    <>
      <div className="relative flex h-[160px] items-start justify-end border-b border-border/50 bg-tertiary/50 p-3 transition-colors group-hover:bg-transparent overflow-hidden">
        {/* Thumbnail Image */}
        {room.thumbnail_url ? (
          <img
            src={`${room.thumbnail_url}?t=${new Date(room.updated_at || Date.now()).getTime()}`}
            alt="Canvas thumbnail"
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        ) : null}

        <div className="relative flex gap-2 z-10">
          {/* Role Badge */}
          <div
            className="flex h-9 bg-[rgba(150,150,150,0.1)] text-secondary cursor-default select-none items-center justify-center rounded-[var(--border-radius-1)] px-3 text-[0.7rem] font-bold uppercase tracking-wider transition-colors"
            title={`You are a ${isHost ? "Host" : "Guest"} in this room`}
          >
            {isHost ? "Host" : "Guest"}
          </div>

          <button
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] text-secondary transition-all duration-200 ease-in hover:bg-success/10 hover:text-success active:scale-95"
            onClick={() => onJoin(room.id)}
            title="Join room"
          >
            <IoArrowForwardOutline size={18} />
          </button>

          {isHost ? (
            <button
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] text-secondary transition-all duration-200 ease-in hover:bg-danger/10 hover:text-danger active:scale-95"
              onClick={() => onDelete(room.id)}
              title="Delete room"
            >
              <IoTrashOutline size={18} />
            </button>
          ) : (
            <button
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--border-radius-1)] border-none bg-[rgba(150,150,150,0.1)] text-secondary transition-all duration-200 ease-in hover:bg-danger/10 hover:text-danger active:scale-95"
              onClick={() => onLeave(room.id)}
              title="Leave room"
            >
              <IoLogOutOutline size={18} className="translate-x-[1px]" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-5">
        <div className="flex flex-col">
          {isEditing && isHost ? (
            <div className="flex w-full items-center gap-2 rounded-md border border-border/80 bg-[rgba(150,150,150,0.05)] px-2.5 py-1.5 transition-all duration-200">
              <IoPencilOutline className="shrink-0 text-secondary" size={16} />
              <input
                type="text"
                className="w-full min-w-0 bg-transparent text-[0.9rem] font-medium text-secondary outline-none"
                value={editName}
                onChange={(e) => onEditChange(e.target.value)}
                onBlur={() => onSave(room)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSave(room);
                  if (e.key === "Escape") onCancel();
                }}
                autoFocus
              />
            </div>
          ) : (
            <button
              className={`flex w-full items-center gap-2 bg-[rgba(150,150,150,0.05)] rounded-md border border-transparent px-2.5 py-1.5 text-left transition-all duration-200 ${
                isHost
                  ? "cursor-text hover:border-border/60 hover:bg-[rgba(150,150,150,0.1)]"
                  : "cursor-not-allowed"
              }`}
              onClick={() => isHost && onStartEdit(room)}
              title={isHost ? "Click to edit title" : "Room title"}
            >
              {isHost ? (
                <IoPencilOutline className="shrink-0 text-secondary" size={16} />
              ) : (
                <IoTextOutline className="shrink-0 text-secondary" size={16} />
              )}
              <span
                className={`truncate text-[0.9rem] font-medium text-secondary ${!isHost && "px-1"}`}
              >
                {room.title}
              </span>
            </button>
          )}
        </div>

        <button
          className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-md border border-transparent bg-[rgba(150,150,150,0.05)] px-2.5 py-1.5 text-left transition-all duration-200 hover:border-border/60 hover:bg-[rgba(150,150,150,0.1)] active:scale-[0.98]"
          onClick={() => onCopy(room.id)}
          title="Copy code"
        >
          <IoCopyOutline className="shrink-0 text-secondary" size={16} />
          <span className="truncate font-mono text-[0.85rem] font-medium tracking-wide text-secondary">
            {room.id}
          </span>
        </button>

        {!isHost && room.host_name && (
          <span className="px-1 pt-1 text-[0.75rem] font-medium text-secondary/70">
            Hosted by {room.host_name}
          </span>
        )}
      </div>
    </>
  );
};
