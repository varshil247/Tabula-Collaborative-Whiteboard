/**
 * Floating textarea overlay for inline text editing on the canvas
 * Synchronizes with Konva Text nodes
 */

import React from "react";

interface TextEditorProps {
  editingId: string | null;
  editingText: string;
  shapes: any[];
  stageScale: number;
  dragX: number;
  dragY: number;
  setEditingText: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  editingId,
  editingText,
  shapes,
  stageScale,
  dragX,
  dragY,
  setEditingText,
  onSave,
  onCancel,
}) => {
  if (!editingId) return null;

  const shape = shapes.find((s: any) => s.uuid === editingId);
  if (!shape) return null;

  return (
    <textarea
      style={{
        position: "absolute",
        top: `${shape.posY * stageScale + dragY}px`,
        left: `${shape.posX * stageScale + dragX}px`,
        fontSize: `${shape.config.fontSize * stageScale * (shape.config.scaleY || 1)}px`,
        fontFamily: shape.config.fontFamily,
        color: shape.config.fill,
        border: "2px dashed #3b82f6",
        borderRadius: "4px",
        background: "transparent",
        resize: "none",
        outline: "none",
        zIndex: 1000,
        padding: "0",
        margin: 0,
        minWidth: "200px",
        minHeight: "50px",
        lineHeight: 1.2,
      }}
      value={editingText}
      onChange={(e) => setEditingText(e.target.value)}
      onBlur={onSave}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSave();
        }
        if (e.key === "Escape") onCancel();
      }}
      autoFocus
    />
  );
};
