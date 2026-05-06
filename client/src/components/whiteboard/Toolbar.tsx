/**
 * Floating toolbar component for tool selection and configuration
 * Includes pen color/size and shape selection menus
 */

import React from "react";
import { IoTriangle, IoShapesOutline, IoShapes } from "react-icons/io5";
import { TbEraser, TbBallpen, TbOvalVerticalFilled, TbPointer } from "react-icons/tb";
import { MdOutlineTextFields, MdStar, MdCircle, MdRectangle, MdHexagon } from "react-icons/md";
import { BiCloudUpload } from "react-icons/bi";
import { COLORS, SHAPE_TOOLS, TOOLS } from "../../utils/constants";

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  showPenConfig: boolean;
  setShowPenConfig: (show: boolean) => void;
  showShapeMenu: boolean;
  setShowShapeMenu: (show: boolean) => void;
  penColor: string;
  setPenColor: (color: string) => void;
  penThickness: number;
  setPenThickness: (thickness: number) => void;
  selectedShapeColor: string;
  setSelectedShapeColor: (color: string) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SHAPE_MENU_ITEMS = [
  { icon: MdOutlineTextFields, id: TOOLS.TEXT, title: "Text" },
  { icon: MdRectangle, id: TOOLS.RECTANGLE, title: "Rectangle" },
  { icon: MdCircle, id: TOOLS.CIRCLE, title: "Circle" },
  { icon: TbOvalVerticalFilled, id: TOOLS.ELLIPSE, title: "Oval" },
  { icon: IoTriangle, id: TOOLS.TRIANGLE, title: "Triangle" },
  { icon: MdStar, id: TOOLS.STAR, title: "Star" },
  { icon: MdHexagon, id: TOOLS.HEXAGON, title: "Hexagon" },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  showPenConfig,
  setShowPenConfig,
  showShapeMenu,
  setShowShapeMenu,
  penColor,
  setPenColor,
  penThickness,
  setPenThickness,
  selectedShapeColor,
  setSelectedShapeColor,
  onImageUpload,
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[200] flex gap-1 p-2 bg-secondary/85 backdrop-blur-xl shadow-xl border border-border/40 rounded-2xl pointer-events-auto">
      {/* Select Tool */}
      <button
        className={`flex h-11 w-11 items-center justify-center rounded-xl border-none transition-all duration-200 ${activeTool === TOOLS.SELECT ? "bg-brand text-white shadow-md" : "bg-transparent text-secondary hover:bg-tertiary hover:text-primary"}`}
        onClick={() => {
          setActiveTool(TOOLS.SELECT);
          setShowPenConfig(false);
          setShowShapeMenu(false);
        }}
        title="Select / Pan"
      >
        <TbPointer size={22} />
      </button>

      <div className="w-[1px] h-8 bg-border/60 self-center"></div>

      {/* Pen Tool & Config */}
      <div className="relative flex items-center">
        <button
          className={`flex h-11 w-11 items-center justify-center rounded-xl border-none transition-all duration-200 ${activeTool === TOOLS.PEN ? "bg-brand text-white shadow-md" : "bg-transparent text-secondary hover:bg-tertiary hover:text-primary"}`}
          onClick={() => {
            if (activeTool === TOOLS.PEN) setShowPenConfig(!showPenConfig);
            else {
              setActiveTool(TOOLS.PEN);
              setShowPenConfig(true);
              setShowShapeMenu(false);
            }
          }}
          title="Draw"
        >
          <TbBallpen size={22} />
        </button>

        {showPenConfig && activeTool === TOOLS.PEN && (
          <div className="absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 flex flex-col gap-3 p-4 bg-secondary/95 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setPenColor(color)}
                  className={`w-6 h-6 rounded-full shadow-sm transition-transform duration-200 ${penColor === color ? "scale-125 ring-2 ring-brand ring-offset-2 ring-offset-secondary" : "hover:scale-110"}`}
                  style={{
                    backgroundColor: color,
                    border:
                      color === "#ffffff" || color === "#000000"
                        ? "1px solid var(--border-color)"
                        : "none",
                  }}
                />
              ))}
            </div>
            <div className="h-[1px] w-full bg-border/50"></div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-secondary">Size</span>
              <input
                type="range"
                className="w-full accent-brand cursor-pointer"
                value={penThickness}
                min="1"
                max="30"
                onChange={(e) => setPenThickness(parseInt(e.target.value, 10))}
              />
              <span className="text-xs font-mono text-secondary w-[20px]">{penThickness}</span>
            </div>
          </div>
        )}
      </div>

      {/* Eraser Tool */}
      <button
        className={`flex h-11 w-11 items-center justify-center rounded-xl border-none transition-all duration-200 ${activeTool === TOOLS.ERASER ? "bg-danger text-white shadow-md" : "bg-transparent text-secondary hover:bg-tertiary hover:text-primary"}`}
        onClick={() => {
          setActiveTool(TOOLS.ERASER);
          setShowPenConfig(false);
          setShowShapeMenu(false);
        }}
        title="Eraser"
      >
        <TbEraser size={22} />
      </button>

      <div className="w-[1px] h-8 bg-border/60 self-center"></div>

      {/* Shapes Tool & Menu */}
      <div className="relative flex items-center">
        <button
          className={`flex h-11 w-11 items-center justify-center rounded-xl border-none transition-all duration-200 ${(SHAPE_TOOLS as readonly string[]).includes(activeTool) ? "bg-brand text-white shadow-md" : "bg-transparent text-secondary hover:bg-tertiary hover:text-primary"}`}
          onClick={() => {
            if ((SHAPE_TOOLS as readonly string[]).includes(activeTool)) setShowShapeMenu(!showShapeMenu);
            else {
              setActiveTool(TOOLS.RECTANGLE);
              setShowShapeMenu(true);
              setShowPenConfig(false);
            }
          }}
          title="Shapes & Text"
        >
          {(SHAPE_TOOLS as readonly string[]).includes(activeTool) ? (
            <IoShapes size={22} />
          ) : (
            <IoShapesOutline size={22} />
          )}
        </button>

        {showShapeMenu && (SHAPE_TOOLS as readonly string[]).includes(activeTool) && (
          <div className="absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 flex flex-col gap-3 p-3 bg-secondary/95 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl animate-in fade-in zoom-in-95 duration-200 w-[180px]">
            <div className="flex gap-2 justify-center flex-wrap px-1 pb-2 border-b border-border/50">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedShapeColor(color)}
                  className={`w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ${selectedShapeColor === color ? "scale-125 ring-2 ring-brand ring-offset-2 ring-offset-secondary" : "hover:scale-110"}`}
                  style={{
                    backgroundColor: color,
                    border:
                      color === "#ffffff" || color === "#000000"
                        ? "1px solid var(--border-color)"
                        : "none",
                  }}
                />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {SHAPE_MENU_ITEMS.map((tool, idx) => (
                <button
                  key={idx}
                  className={`flex aspect-square items-center justify-center rounded-xl border-none transition-all hover:scale-105 active:scale-95 ${activeTool === tool.id ? "bg-brand/20 text-brand" : "bg-[rgba(150,150,150,0.05)] text-secondary hover:bg-[rgba(150,150,150,0.15)] hover:text-primary"}`}
                  onClick={() => setActiveTool(tool.id)}
                  title={tool.title}
                >
                  <tool.icon size={20} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-[1px] h-8 bg-border/60 self-center"></div>

      {/* Image Upload */}
      <div className="flex items-center">
        <label
          htmlFor="file-upload"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border-none bg-transparent text-secondary transition-all hover:bg-tertiary hover:text-primary active:scale-95 m-0"
          title="Upload Image"
        >
          <BiCloudUpload size={24} />
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};
