/**
 * Top-left action buttons for Undo, Redo, and Clear Board
 */

import React from "react";
import { FaUndo, FaRedo } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";

interface ActionButtonsProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  canClear: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
  canClear,
}) => {
  return (
    <div className="absolute top-5 left-5 z-[200] flex gap-2 pointer-events-none">
      <div className="flex bg-secondary/80 backdrop-blur-xl p-1.5 rounded-xl shadow-sm border border-border/50 pointer-events-auto">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-transparent text-secondary transition-all hover:bg-[rgba(150,150,150,0.1)] hover:text-primary active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <FaUndo size={14} />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-transparent text-secondary transition-all hover:bg-[rgba(150,150,150,0.1)] hover:text-primary active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <FaRedo size={14} />
        </button>
        <div className="w-[2px] h-6 bg-border self-center mx-1"></div>
        <button
          className="flex h-8 px-2.5 items-center justify-center gap-1.5 rounded-lg border-none bg-transparent text-danger transition-all hover:bg-danger/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onClear}
          disabled={!canClear}
          title="Clear Board"
        >
          <IoTrashOutline size={16} />
        </button>
      </div>
    </div>
  );
};
