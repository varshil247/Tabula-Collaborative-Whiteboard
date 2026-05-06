/**
 * Main Whiteboard application component
 * Orchestrates canvas logic, real-time sync, and UI components
 */

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";

// Hooks
import {
  useSocket,
  useDrawing,
  useEraser,
  useCanvasViewport,
  useShapeSelection,
  useTextEditing,
  useHistory,
  useImageUpload,
  useCanvasTools,
} from "../hooks";

// Components
import {
  Canvas,
  Toolbar,
  Minimap,
  TextEditor,
  ActionButtons,
} from "./whiteboard/index";

// Utilities & Store
import { setCanvasState } from "../redux/slices/canvasSlice";
import { saveScreenshotToSupabase } from "../utils/screenshotUtils";
import { getShapesInSelectionBox } from "../utils/canvasUtils";
import { TOOLS, SHAPES, HISTORY_TYPES, TEXT_DEFAULTS, SHAPE_DEFAULTS } from "../utils/constants";

const Whiteboard: React.FC = () => {
  // --- Refs ---
  const stageRef = useRef<any>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const trRef = useRef<any>(null);
  const dispatch = useDispatch();

  // --- Custom Hooks Initialization ---

  // 0. Tool Management
  const {
    activeTool,
    setActiveTool,
    penColor,
    setPenColor,
    penThickness,
    setPenThickness,
    selectedShapeColor,
    setSelectedShapeColor,
    showPenConfig,
    setShowPenConfig,
    showShapeMenu,
    setShowShapeMenu,
  } = useCanvasTools();

  // --- Remote Collaboration State ---
  const [remoteDrawings, setRemoteDrawings] = useState<Map<string, any>>(new Map());
  const [remoteLiveObjects, setRemoteLiveObjects] = useState<Map<string, any>>(new Map());
  const [remoteCursors, setRemoteCursors] = useState<Map<string, any>>(new Map());

  // --- Redux Data ---
  const { user } = useSelector((state: any) => state.user || {});
  const roomCodeState = useSelector((state: any) => state.roomCode || {});
  const roomCode =
    roomCodeState?.roomCode || (typeof roomCodeState === "string" ? roomCodeState : null);
  const shapes = useSelector((state: any) => state.canvas?.shapes || []);

  // Sync ref for optimistic updates (erasing)
  const shapesRef = useRef<any[]>(shapes);
  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

  // 1. Viewport Management
  const {
    dragState,
    stageScale,
    handleWheel,
    handleDragMove,
    handleMinimapClick,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useCanvasViewport();

  // 2. Socket Synchronization
  const { emitCanvasUpdate, emitDrawing, emitObjectUpdate, emitCursorMove } = useSocket({
    roomCode,
    onCanvasState: (state) => state && dispatch(setCanvasState(state)),
    onCanvasUpdate: (state) => state && dispatch(setCanvasState(state)),
    onDrawing: (line) => {
      if (line && line.uuid) setRemoteDrawings((prev) => new Map(prev).set(line.uuid, line));
    },
    onObjectUpdate: (obj) => {
      if (obj && obj.uuid) setRemoteLiveObjects((prev) => new Map(prev).set(obj.uuid, obj));
    },
    onCursorMove: (cursor) => {
      setRemoteCursors((prev) => new Map(prev).set(cursor.userId, cursor));
    },
    onUserDisconnect: (userId) => {
      setRemoteCursors((prev) => {
        const updated = new Map(prev);
        updated.delete(userId);
        return updated;
      });
    },
  });

  // Helper to sync latest shapes to all clients
  const syncShapes = useCallback(
    (updatedShapes: any[]) => {
      dispatch(setCanvasState(updatedShapes));
      emitCanvasUpdate(updatedShapes);
    },
    [dispatch, emitCanvasUpdate],
  );

  // 3. History (Undo/Redo)
  const { undo, redo, addToHistory, clearHistory, canUndo, canRedo } = useHistory(
    shapes,
    syncShapes,
  );

  // 4. Drawing Logic
  const { isDrawing, lines, startDrawing, addPointToLine, finishDrawing, removeLine } =
    useDrawing();

  const [currentShape, setCurrentShape] = useState<any>(null);

  // 5. Eraser Logic
  const { eraseAtPosition, savePreEraseState, getPreEraseState, clearPreEraseState } =
    useEraser(syncShapes);

  const [eraserPos, setEraserPos] = useState<{ x: number; y: number } | null>(null);

  // 6. Shape Selection & Transformation
  const {
    selectedShapeIds,
    setSelectedShapeIds,
    selectionBox,
    handleSelectShape,
    startSelectionBox,
    updateSelectionBox,
    completeSelectionBox,
  } = useShapeSelection();

  // 7. Text Editing
  const {
    isEditing,
    editingText,
    editingId,
    setIsEditing,
    setEditingText,
    startEditing,
    saveTextChanges,
    updateTextLive,
  } = useTextEditing(shapes, syncShapes, addToHistory);

  // 8. Image Upload
  const { uploadImage } = useImageUpload();

  // --- Side Effects ---

  // Update Transformer nodes when selection changes
  useEffect(() => {
    if (trRef.current) {
      const nodes = selectedShapeIds
        .map((id) => stageRef.current?.findOne(`#${id}`))
        .filter(Boolean);
      trRef.current.nodes(nodes);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedShapeIds, shapes]);

  // Cleanup remote previews when shapes are updated from server
  useEffect(() => {
    setRemoteDrawings((prev) => {
      const updated = new Map(prev);
      shapes.forEach((s: any) => updated.delete(s.uuid));
      return updated;
    });

    setRemoteLiveObjects((prev) => {
      const updated = new Map(prev);
      shapes.forEach((shape: any) => {
        const live = updated.get(shape.uuid);
        if (
          live &&
          live.posX === shape.posX &&
          live.posY === shape.posY &&
          live.scaleX === shape.config?.scaleX
        ) {
          updated.delete(shape.uuid);
        }
      });
      return updated;
    });
  }, [shapes]);

  // Handle auto-save screenshot on exit
  useEffect(() => {
    return () => {
      if (roomCode && shapesRef.current.length > 0) {
        saveScreenshotToSupabase(roomCode, shapesRef.current);
      }
    };
  }, [roomCode]);

  // --- Handlers ---

  const getRelativePointerPosition = useCallback(() => {
    return stageRef.current
      ?.getAbsoluteTransform()
      .copy()
      .invert()
      .point(stageRef.current.getPointerPosition());
  }, []);

  const handlePointerDown = (e: any) => {
    const pos = getRelativePointerPosition();
    if (!pos) return;

    if (activeTool === TOOLS.SELECT) {
      const clickedOnEmpty = e.target === stageRef.current;
      if (clickedOnEmpty) {
        startSelectionBox(pos);
      }
      return;
    }

    if (activeTool === TOOLS.ERASER) {
      savePreEraseState(shapesRef.current);
      eraseAtPosition(pos, shapesRef.current);
      return;
    }

    if (activeTool === TOOLS.TEXT) {
      const newShape = {
        uuid: uuidv4(),
        shape: SHAPES.TEXT,
        posX: pos.x,
        posY: pos.y,
        user: user?.user || "anonymous",
        config: {
          text: TEXT_DEFAULTS.PLACEHOLDER,
          fontSize: TEXT_DEFAULTS.FONT_SIZE,
          fontFamily: TEXT_DEFAULTS.FONT_FAMILY,
          fill: selectedShapeColor,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        },
      };
      saveFinalShape(newShape);
      setActiveTool(TOOLS.SELECT);
      setSelectedShapeIds([newShape.uuid]);
      return;
    }

    if (activeTool === TOOLS.PEN) {
      const newLine = startDrawing(pos, penColor, penThickness, user?.user_id || "anonymous");
      emitDrawing(newLine);
    } else {
      const newShape = {
        uuid: uuidv4(),
        shape: activeTool,
        posX: pos.x,
        posY: pos.y,
        config: {
          fill: selectedShapeColor,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          width: 0,
          height: 0,
          radius: 0,
          radiusX: 0,
          radiusY: 0,
          numPoints: 5,
          innerRadius: 0,
          outerRadius: 0,
        },
      };
      setCurrentShape(newShape);
    }
  };

  const handlePointerMove = (e: any) => {
    const pos = getRelativePointerPosition();
    if (!pos) return;

    if (activeTool === TOOLS.SELECT && selectionBox?.visible) {
      updateSelectionBox(pos);
      return;
    }

    // Real-time cursor sync
    emitCursorMove({ x: pos.x, y: pos.y, userName: user?.user_email?.split("@")[0] || "Anonymous" });

    if (activeTool === TOOLS.ERASER) {
      setEraserPos(pos);
      if (getPreEraseState()) eraseAtPosition(pos, shapesRef.current);
      return;
    }

    if (isDrawing) {
      const updatedLine = addPointToLine(pos);
      if (updatedLine) emitDrawing(updatedLine);
    } else if (currentShape) {
      const updated = { ...currentShape };
      const dx = pos.x - updated.posX;
      const dy = pos.y - updated.posY;

      // Dynamic shape sizing
      if (activeTool === TOOLS.RECTANGLE) {
        updated.config.width = dx;
        updated.config.height = dy;
      } else if ([TOOLS.CIRCLE, TOOLS.TRIANGLE, TOOLS.HEXAGON].includes(activeTool as any)) {
        updated.config.radius = Math.sqrt(dx * dx + dy * dy);
      } else if (activeTool === TOOLS.ELLIPSE) {
        updated.config.radiusX = Math.abs(dx);
        updated.config.radiusY = Math.abs(dy);
      } else if (activeTool === TOOLS.STAR) {
        const r = Math.sqrt(dx * dx + dy * dy);
        updated.config.outerRadius = r;
        updated.config.innerRadius = r / 2;
      }

      setCurrentShape(updated);
      emitObjectUpdate(updated);
    }
  };

  const handlePointerUp = () => {
    if (activeTool === TOOLS.SELECT && selectionBox?.visible) {
      completeSelectionBox(shapesRef.current);
      return;
    }

    if (activeTool === TOOLS.ERASER) {
      const prevState = getPreEraseState();
      if (prevState) {
        addToHistory({
          type: HISTORY_TYPES.ERASE_BATCH,
          previousShapes: prevState,
          newShapes: shapesRef.current,
        });
        clearPreEraseState();
      }
      return;
    }

    if (isDrawing) {
      const line = finishDrawing();
      if (line) {
        saveFinalShape(line);
        removeLine(line.uuid);
      }
    } else if (currentShape) {
      let finalShape = { ...currentShape };
      const config = finalShape.config;

      // Set default sizes if dragged too small
      if (!config.width && !config.radius && !config.radiusX && !config.outerRadius) {
        if (finalShape.shape === TOOLS.RECTANGLE) {
          config.width = SHAPE_DEFAULTS.RECTANGLE.width;
          config.height = SHAPE_DEFAULTS.RECTANGLE.height;
        } else if ([TOOLS.CIRCLE, TOOLS.TRIANGLE, TOOLS.HEXAGON].includes(finalShape.shape)) {
          config.radius = SHAPE_DEFAULTS.CIRCLE.radius;
        } else if (finalShape.shape === TOOLS.ELLIPSE) {
          config.radiusX = SHAPE_DEFAULTS.ELLIPSE.radiusX;
          config.radiusY = SHAPE_DEFAULTS.ELLIPSE.radiusY;
        } else if (finalShape.shape === TOOLS.STAR) {
          config.outerRadius = SHAPE_DEFAULTS.STAR.outerRadius;
          config.innerRadius = SHAPE_DEFAULTS.STAR.innerRadius;
        }
      }

      saveFinalShape(finalShape);
      setCurrentShape(null);
      setActiveTool(TOOLS.SELECT);
      setSelectedShapeIds([finalShape.uuid]);
    }
  };

  const saveFinalShape = (shape: any) => {
    const updatedShapes = [...shapes, shape];
    syncShapes(updatedShapes);
    addToHistory({ type: HISTORY_TYPES.CREATE, uuid: shape.uuid, object: shape });
  };

  const handleTransformMove = (e: any, uuid: string) => {
    emitObjectUpdate({
      uuid,
      posX: e.target.x(),
      posY: e.target.y(),
      scaleX: e.target.scaleX(),
      scaleY: e.target.scaleY(),
      rotation: e.target.rotation(),
    });
  };

  const handleTransformEnd = (shape: any, e: any) => {
    const newShape = {
      ...shape,
      posX: e.target.x(),
      posY: e.target.y(),
      config: {
        ...shape.config,
        scaleX: e.target.scaleX(),
        scaleY: e.target.scaleY(),
        rotation: e.target.rotation(),
      },
    };
    const updatedShapes = shapes.map((s: any) => (s.uuid === shape.uuid ? newShape : s));
    syncShapes(updatedShapes);
    addToHistory({
      type: HISTORY_TYPES.TRANSFORM,
      uuid: shape.uuid,
      prevShape: shape,
      newShape,
    });
  };

  const handleSelectShapeClick = (e: any, id: string) => {
    if (activeTool !== TOOLS.SELECT) return;
    const isMultiSelect = e.evt.shiftKey || e.evt.ctrlKey;
    handleSelectShape(id, isMultiSelect);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const pos = getRelativePointerPosition() || { x: 100, y: 100 };
    const newShape = await uploadImage(file, roomCode, pos);
    if (newShape) saveFinalShape(newShape);
  };

  const handleClearBoard = async () => {
    if (shapes.length === 0) return;

    // Call API to delete images from storage
    const pathsToDelete = shapes
      .filter((s: any) => s.shape === SHAPES.IMAGE && s.config.storagePath)
      .map((s: any) => s.config.storagePath);

    if (pathsToDelete.length > 0) {
      fetch(`${import.meta.env.VITE_SERVER_URL || "http://localhost:3000"}/api/delete-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: pathsToDelete }),
      }).catch(console.error);
    }

    addToHistory({ type: HISTORY_TYPES.CLEAR, previousShapes: [...shapes] });
    syncShapes([]);
    setSelectedShapeIds([]);
  };

  // Keyboard support for deletion
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedShapeIds.length > 0 &&
        !isEditing
      ) {
        const deletedObjects = shapes.filter((s: any) => selectedShapeIds.includes(s.uuid));
        const updatedShapes = shapes.filter((s: any) => !selectedShapeIds.includes(s.uuid));

        syncShapes(updatedShapes);
        addToHistory({
          type: HISTORY_TYPES.DELETE_MULTI,
          uuids: selectedShapeIds,
          objects: deletedObjects,
        });
        setSelectedShapeIds([]);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedShapeIds, shapes, isEditing, syncShapes, addToHistory, setSelectedShapeIds]);

  // Viewport board dimensions
  const boardWidth = boardRef.current?.offsetWidth || window.innerWidth;
  const boardHeight = boardRef.current?.offsetHeight || window.innerHeight;

  return (
    <div
      className="relative flex-1 rounded-[var(--border-radius-1)] bg-primary overflow-hidden shadow-sm border border-border/40 transition-all"
      style={{
        backgroundImage: `radial-gradient(var(--border-color) 1px, transparent 1px)`,
        backgroundSize: `${24 * stageScale}px ${24 * stageScale}px`,
        backgroundPosition: `${dragState.dragX}px ${dragState.dragY}px`,
        opacity: 0.95,
      }}
      ref={boardRef}
    >
      <TextEditor
        editingId={editingId}
        editingText={editingText}
        shapes={shapes}
        stageScale={stageScale}
        dragX={dragState.dragX}
        dragY={dragState.dragY}
        setEditingText={(text) => updateTextLive(text, emitObjectUpdate)}
        onSave={saveTextChanges}
        onCancel={() => setIsEditing(false)}
      />

      <ActionButtons
        onUndo={undo}
        onRedo={redo}
        onClear={handleClearBoard}
        canUndo={canUndo}
        canRedo={canRedo}
        canClear={shapes.length > 0}
      />

      <div className="absolute top-5 right-5 z-[200] flex flex-col gap-3 items-end pointer-events-none">
        <Minimap
          shapes={shapes}
          remoteLiveObjects={remoteLiveObjects}
          remoteDrawings={remoteDrawings}
          currentShape={currentShape}
          lines={lines}
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          dragX={dragState.dragX}
          dragY={dragState.dragY}
          stageScale={stageScale}
          onMinimapClick={(e) => handleMinimapClick(e, boardWidth, boardHeight)}
        />
        <div className="flex items-center w-full justify-between bg-secondary/80 backdrop-blur-xl p-1.5 rounded-xl shadow-sm border border-border/50 pointer-events-auto">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-transparent text-secondary transition-all hover:bg-[rgba(150,150,150,0.1)] hover:text-primary active:scale-95"
            onClick={zoomOut}
          >
            -
          </button>
          <span
            className="text-[0.75rem] font-bold text-secondary w-[45px] text-center select-none cursor-pointer transition-colors hover:text-primary"
            onClick={resetZoom}
          >
            {Math.round(stageScale * 100)}%
          </span>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-transparent text-secondary transition-all hover:bg-[rgba(150,150,150,0.1)] hover:text-primary active:scale-95"
            onClick={zoomIn}
          >
            +
          </button>
        </div>
      </div>

      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        showPenConfig={showPenConfig}
        setShowPenConfig={setShowPenConfig}
        showShapeMenu={showShapeMenu}
        setShowShapeMenu={setShowShapeMenu}
        penColor={penColor}
        setPenColor={(color: string) => setPenColor(color as any)}
        penThickness={penThickness}
        setPenThickness={setPenThickness}
        selectedShapeColor={selectedShapeColor as string}
        setSelectedShapeColor={(color: string) => setSelectedShapeColor(color as any)}
        onImageUpload={handleImageUpload}
      />

      <Canvas
        boardWidth={boardWidth}
        boardHeight={boardHeight}
        stageRef={stageRef}
        trRef={trRef}
        dragX={dragState.dragX}
        dragY={dragState.dragY}
        stageScale={stageScale}
        activeTool={activeTool}
        selectedShapeIds={selectedShapeIds}
        shapes={shapes}
        remoteLiveObjects={remoteLiveObjects}
        remoteDrawings={remoteDrawings}
        currentShape={currentShape}
        lines={lines}
        selectionBox={selectionBox}
        eraserPos={eraserPos}
        remoteCursors={remoteCursors}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={(e) => handleWheel(e, stageRef.current)}
        onMouseLeave={() => {
          setEraserPos(null);
          if (isDrawing || currentShape) handlePointerUp();
        }}
        onDragMoveStage={handleDragMove}
        onSelectShape={handleSelectShapeClick}
        onTransformMove={handleTransformMove}
        onTransformEnd={handleTransformEnd}
        onTextDblClick={(shape) => startEditing(shape.uuid, shape.config.text)}
      />
    </div>
  );
};

export default Whiteboard;
