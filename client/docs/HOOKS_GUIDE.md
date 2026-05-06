# Custom Hooks Reference Guide

Complete reference for using custom hooks in the Collaborative Whiteboard application.

## Overview

Custom hooks encapsulate reusable stateful logic and side effects. Each hook manages a specific domain:

- **useSocket** - WebSocket connection and communication
- **useEraser** - Eraser tool functionality
- **useCanvasViewport** - Pan and zoom controls
- **useDrawing** - Pen drawing state
- **useShapeSelection** - Multi-select shape management
- **useCanvasTools** - Tool state and configuration
- **useTextEditing** - Text editing state
- **useTheme** - Theme context (existing)

## Hook Patterns

### 1. useSocket - WebSocket Management

Manages WebSocket connection lifecycle and event handling.

**Usage:**

```typescript
import { useSocket } from "../hooks";

export const Whiteboard = ({ roomCode }: Props) => {
  const {
    socketRef,
    emitCanvasUpdate,
    emitDrawing,
    emitObjectUpdate,
  } = useSocket(roomCode, {
    onCanvasState: (state) => setShapes(state),
    onDrawing: (line) => addRemoteDrawing(line),
    onObjectUpdate: (obj) => updateRemoteObject(obj),
  });

  // Use socket reference
  const handleJoinRoom = () => {
    socketRef.current?.emit("join_room", { roomCode });
  };

  // Send updates
  const handleShapeCreated = (shape) => {
    emitCanvasUpdate(roomCode, shapes);
  };

  return <canvas>...</canvas>;
};
```

**API:**

```typescript
interface UseSocketReturn {
  socketRef: React.MutableRefObject<Socket | null>;
  emitCanvasUpdate: (roomCode: string, state: Shape[]) => void;
  emitDrawing: (roomCode: string, line: Shape) => void;
  emitObjectUpdate: (roomCode: string, object: any) => void;
}

function useSocket(roomCode?: string, handlers?: SocketHandlers): UseSocketReturn;
```

**Events Handled:**

- `canvas_state` - Full canvas state sync
- `canvas_update` - Canvas changes from remote user
- `drawing` - Live stroke preview
- `object_update` - Shape transformation updates

### 2. useEraser - Eraser Tool

Point-based erasure for pen strokes and shapes.

**Usage:**

```typescript
import { useEraser } from "../hooks";

export const Whiteboard = () => {
  const { eraseAtPosition, savePreEraseState, clearPreEraseState } =
    useEraser((updatedShapes) => {
      dispatch(setCanvasState(updatedShapes));
    });

  const handleMouseMove = (e) => {
    if (activeTool !== "eraser") return;

    const { updatedShapes, shapeModified } = eraseAtPosition(
      { x: e.clientX, y: e.clientY },
      shapes,
      15 // eraser radius
    );

    if (shapeModified) {
      dispatch(setCanvasState(updatedShapes));
    }
  };

  const handleUndo = () => {
    const preEraseState = getPreEraseState();
    if (preEraseState) {
      dispatch(setCanvasState(preEraseState));
      clearPreEraseState();
    }
  };

  return <canvas onMouseMove={handleMouseMove}>...</canvas>;
};
```

**API:**

```typescript
interface EraserResult {
  updatedShapes: Shape[];
  pathsToDelete: string[];
  shapeModified: boolean;
}

interface UseEraserReturn {
  eraseAtPosition: (pos: Point, shapes: Shape[], eraserRadius: number) => EraserResult;
  savePreEraseState: () => void;
  getPreEraseState: () => Shape[] | null;
  clearPreEraseState: () => void;
}

function useEraser(onUpdate?: (shapes: Shape[]) => void): UseEraserReturn;
```

**Erasure Logic:**

- **Pen strokes**: Removes points within radius, keeps segments ≥4 points
- **Rectangles/Text**: Uses axis-aligned bounding box (AABB)
- **Circles/Polygons**: Uses distance-based detection

### 3. useCanvasViewport - Pan and Zoom

Manages viewport position and zoom level.

**Usage:**

```typescript
import { useCanvasViewport } from "../hooks";

export const Whiteboard = () => {
  const {
    dragState,
    stageScale,
    handleWheel,
    handleDragMove,
    handleMinimapClick,
    zoomIn,
    zoomOut,
    resetZoom,
    setViewport,
  } = useCanvasViewport();

  // Zoom with mouse wheel
  const handleCanvasWheel = (e) => {
    handleWheel(e, stageRef);
  };

  // Pan with middle mouse button
  const handleMouseDown = () => {
    stageRef.current?.on("dragmove", handleDragMove);
  };

  // Minimap navigation
  const handleMinimapClick = (e) => {
    handleMinimapClick(e, boardWidth, boardHeight);
  };

  return (
    <div>
      <canvas
        onWheel={handleCanvasWheel}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate(${dragState.dragX}px, ${dragState.dragY}px) scale(${stageScale})`,
        }}
      >
        ...
      </canvas>

      <div className="zoom-controls">
        <button onClick={zoomIn}>+</button>
        <span>{Math.round(stageScale * 100)}%</span>
        <button onClick={zoomOut}>-</button>
        <button onClick={resetZoom}>Reset</button>
      </div>
    </div>
  );
};
```

**API:**

```typescript
interface ViewportState {
  dragX: number;
  dragY: number;
}

interface UseCanvasViewportReturn {
  dragState: ViewportState;
  stageScale: number;
  handleWheel: (e: WheelEvent, stageRef: React.RefObject<any>) => void;
  handleDragMove: (e: any) => void;
  handleMinimapClick: (e: any, boardWidth: number, boardHeight: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setViewport: (x: number, y: number, scale: number) => void;
}

function useCanvasViewport(): UseCanvasViewportReturn;
```

**Zoom Range:** 0.1x to 5x (configurable in constants)

### 4. useDrawing - Pen Drawing State

Manages pen drawing state and line creation.

**Usage:**

```typescript
import { useDrawing } from "../hooks";

export const Whiteboard = () => {
  const {
    isDrawing,
    currentLine,
    lines,
    startDrawing,
    addPointToLine,
    finishDrawing,
    clearLines,
    removeLine,
    getPreviewLines,
  } = useDrawing();

  const handleMouseDown = (e) => {
    if (activeTool !== "pen") return;
    startDrawing({ x: e.clientX, y: e.clientY }, penColor, penThickness);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    addPointToLine({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    const completedLine = finishDrawing();
    if (completedLine) {
      emitDrawing(roomCode, completedLine);
      dispatch(addShape(completedLine));
    }
  };

  return <canvas onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>...</canvas>;
};
```

**API:**

```typescript
interface DrawingLine {
  uuid: string;
  shape: "pen";
  config: {
    points: number[];
    color: string;
    thickness: number;
  };
  timestamp: number;
}

interface UseDrawingReturn {
  isDrawing: boolean;
  currentLine: DrawingLine | null;
  lines: DrawingLine[];
  startDrawing: (point: Point, color: string, thickness: number) => void;
  addPointToLine: (point: Point) => void;
  finishDrawing: () => DrawingLine | null;
  clearLines: () => void;
  removeLine: (uuid: string) => void;
  getPreviewLines: () => DrawingLine[];
}

function useDrawing(): UseDrawingReturn;
```

**Line Structure:**

- `uuid`: Unique identifier
- `shape`: Always "pen"
- `config.points`: Array of [x, y, x, y, ...] coordinates
- `config.color`: Hex color
- `config.thickness`: Line width in pixels

### 5. useShapeSelection - Multi-Select Management

Manages shape selection and selection box.

**Usage:**

```typescript
import { useShapeSelection } from "../hooks";

export const Whiteboard = () => {
  const {
    selectedShapeIds,
    selectionBox,
    handleSelectShape,
    clearSelection,
    selectOnly,
    addToSelection,
    removeFromSelection,
    setMultipleSelected,
    isSelected,
    getSelectionCount,
    startSelectionBox,
    updateSelectionBox,
    completeSelectionBox,
    cancelSelectionBox,
  } = useShapeSelection();

  // Single click selection
  const handleShapeClick = (shapeId, event) => {
    const isMultiSelect = event.ctrlKey || event.metaKey;
    handleSelectShape(shapeId, isMultiSelect);
  };

  // Drag-select box
  const handleMouseDown = (e) => {
    if (activeTool !== "select") return;
    startSelectionBox({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!selectionBox?.visible) return;
    updateSelectionBox({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (selectionBox?.visible) {
      completeSelectionBox(shapes);
    }
  };

  // Render selection indicators
  return (
    <div>
      {shapes.map(shape => (
        <div
          key={shape.uuid}
          className={isSelected(shape.uuid) ? "selected" : ""}
          onClick={(e) => handleShapeClick(shape.uuid, e)}
        >
          {/* shape rendering */}
        </div>
      ))}

      {/* Selection box visualization */}
      {selectionBox?.visible && (
        <div
          style={{
            position: "absolute",
            left: Math.min(selectionBox.x1, selectionBox.x2),
            top: Math.min(selectionBox.y1, selectionBox.y2),
            width: Math.abs(selectionBox.x1 - selectionBox.x2),
            height: Math.abs(selectionBox.y1 - selectionBox.y2),
            border: "1px dashed blue",
          }}
        />
      )}
    </div>
  );
};
```

**API:**

```typescript
interface UseShapeSelectionReturn {
  selectedShapeIds: string[];
  selectionBox: SelectionBox | null;
  handleSelectShape: (id: string, isMultiSelect?: boolean) => void;
  clearSelection: () => void;
  selectOnly: (id: string) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  setMultipleSelected: (ids: string[]) => void;
  isSelected: (id: string) => boolean;
  getSelectionCount: () => number;
  startSelectionBox: (startPoint: Point) => void;
  updateSelectionBox: (currentPoint: Point) => void;
  completeSelectionBox: (shapes: Shape[]) => void;
  cancelSelectionBox: () => void;
}

function useShapeSelection(): UseShapeSelectionReturn;
```

**Selection Modes:**

- **Single**: Click shape
- **Multi-Add**: Ctrl+Click to add
- **Multi-Remove**: Ctrl+Click selected to remove
- **Drag-Select**: Drag box to select multiple

### 6. useCanvasTools - Tool State Management

Manages active tool, pen config, and menus.

**Usage:**

```typescript
import { useCanvasTools } from "../hooks";

export const Whiteboard = () => {
  const {
    activeTool,
    penColor,
    penThickness,
    selectedShapeColor,
    showPenConfig,
    showShapeMenu,
    selectTool,
    togglePenMenu,
    toggleShapesMenu,
    changePenColor,
    changePenThickness,
    changeShapeColor,
    closeAllMenus,
    getPenConfig,
    getShapeConfig,
  } = useCanvasTools();

  const handleMouseDown = (e) => {
    const config = activeTool === "pen" ? getPenConfig() : getShapeConfig();
    // Use config for drawing...
  };

  return (
    <div>
      <button
        className={activeTool === "pen" ? "active" : ""}
        onClick={() => togglePenMenu()}
      >
        Pen
      </button>

      {showPenConfig && (
        <div>
          <input
            type="color"
            value={penColor}
            onChange={(e) => changePenColor(e.target.value)}
          />
          <input
            type="range"
            value={penThickness}
            onChange={(e) => changePenThickness(Number(e.target.value))}
          />
        </div>
      )}

      <button
        className={["rectangle", "circle", "star"].includes(activeTool) ? "active" : ""}
        onClick={() => toggleShapesMenu()}
      >
        Shapes
      </button>

      {showShapeMenu && (
        <div>
          <input
            type="color"
            value={selectedShapeColor}
            onChange={(e) => changeShapeColor(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
```

**API:**

```typescript
interface UseCanvasToolsReturn {
  activeTool: string;
  penColor: string;
  penThickness: number;
  selectedShapeColor: string;
  showPenConfig: boolean;
  showShapeMenu: boolean;
  selectTool: (tool: string) => void;
  togglePenMenu: () => void;
  toggleShapesMenu: () => void;
  changePenColor: (color: string) => void;
  changePenThickness: (thickness: number) => void;
  changeShapeColor: (color: string) => void;
  closeAllMenus: () => void;
  getPenConfig: () => PenConfig;
  getShapeConfig: () => { color: string };
}

function useCanvasTools(): UseCanvasToolsReturn;
```

### 7. useTextEditing - Text Editing State

Manages text editing mode and current text.

**Usage:**

```typescript
import { useTextEditing } from "../hooks";

export const Whiteboard = () => {
  const {
    isEditing,
    editingId,
    editingText,
    startEditing,
    finishEditing,
    cancelEditing,
    updateEditingText,
    isEditingShape,
  } = useTextEditing();

  const handleTextDoubleClick = (shapeId, currentText) => {
    startEditing(shapeId, currentText);
  };

  const handleTextareaChange = (e) => {
    updateEditingText(e.target.value);
  };

  const handleTextSave = () => {
    const result = finishEditing();
    if (result) {
      const updatedShape = {
        ...shapes.find(s => s.uuid === result.shapeId),
        config: { text: result.newText },
      };
      dispatch(updateShape(updatedShape));
    }
  };

  const handleTextCancel = () => {
    cancelEditing();
  };

  return (
    <div>
      {isEditing && (
        <textarea
          value={editingText}
          onChange={handleTextareaChange}
          onBlur={handleTextSave}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleTextCancel();
            if (e.key === "Enter" && e.ctrlKey) handleTextSave();
          }}
          autoFocus
        />
      )}

      {shapes.map(shape => (
        shape.shape === "text" && (
          <div
            key={shape.uuid}
            onDoubleClick={() => handleTextDoubleClick(shape.uuid, shape.config.text)}
            className={isEditingShape(shape.uuid) ? "editing" : ""}
          >
            {shape.config.text}
          </div>
        )
      ))}
    </div>
  );
};
```

**API:**

```typescript
interface UseTextEditingReturn {
  isEditing: boolean;
  editingId: string | null;
  editingText: string;
  startEditing: (shapeId: string, currentText: string) => void;
  finishEditing: () => { shapeId: string; newText: string } | null;
  cancelEditing: () => void;
  updateEditingText: (text: string) => void;
  isEditingShape: (shapeId: string) => boolean;
}

function useTextEditing(): UseTextEditingReturn;
```

## Hook Composition Example

Complete example combining multiple hooks:

```typescript
import {
  useSocket,
  useCanvasTools,
  useShapeSelection,
  useDrawing,
  useCanvasViewport,
  useTextEditing,
} from "../hooks";

export const Whiteboard = ({ roomCode }: Props) => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const stageRef = useRef<any>(null);

  // Initialize all hooks
  const { socketRef, emitCanvasUpdate, emitDrawing } = useSocket(roomCode, {
    onCanvasState: setShapes,
    onDrawing: (line) => {
      setShapes(prev => [...prev, line]);
      emitCanvasUpdate(roomCode, [...shapes, line]);
    },
  });

  const {
    activeTool,
    penColor,
    penThickness,
    selectTool,
    getPenConfig,
  } = useCanvasTools();

  const {
    selectedShapeIds,
    selectionBox,
    handleSelectShape,
    startSelectionBox,
    updateSelectionBox,
    completeSelectionBox,
  } = useShapeSelection();

  const {
    isDrawing,
    currentLine,
    startDrawing,
    addPointToLine,
    finishDrawing,
  } = useDrawing();

  const {
    dragState,
    stageScale,
    handleWheel,
    zoomIn,
    zoomOut,
  } = useCanvasViewport();

  const {
    isEditing,
    editingId,
    startEditing,
    finishEditing,
  } = useTextEditing();

  // Compose behavior
  const handleMouseDown = (e) => {
    const pos = { x: e.clientX, y: e.clientY };

    switch (activeTool) {
      case "select":
        startSelectionBox(pos);
        break;
      case "pen":
        startDrawing(pos, penColor, penThickness);
        break;
      case "text":
        // Start text editing
        break;
    }
  };

  const handleMouseMove = (e) => {
    const pos = { x: e.clientX, y: e.clientY };

    if (isDrawing) {
      addPointToLine(pos);
    } else if (selectionBox?.visible) {
      updateSelectionBox(pos);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      const line = finishDrawing();
      if (line) {
        setShapes(prev => [...prev, line]);
        emitDrawing(roomCode, line);
      }
    } else if (selectionBox?.visible) {
      completeSelectionBox(shapes);
    }
  };

  return (
    <div className="whiteboard-container">
      <canvas
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={(e) => handleWheel(e, stageRef)}
        style={{
          transform: `translate(${dragState.dragX}px, ${dragState.dragY}px) scale(${stageScale})`,
        }}
      >
        {/* Canvas rendering */}
      </canvas>

      <Toolbar
        activeTool={activeTool}
        onSelectTool={selectTool}
        {...otherProps}
      />
    </div>
  );
};
```

## Best Practices

### 1. Use Barrel Exports

```typescript
// Good - import multiple hooks
import { useSocket, useDrawing, useShapeSelection } from "../hooks";

// Avoid - importing from individual files
import { useSocket } from "../hooks/useSocket";
import { useDrawing } from "../hooks/useDrawing";
```

### 2. Memoize Hook Results

```typescript
// Good - memoize event handlers
const handleSelectShape = useCallback(
  (id, isMulti) => {
    // Logic here
  },
  [dependencies],
);

// Hooks already do this internally
const { handleSelectShape } = useShapeSelection();
```

### 3. Combine Hooks Logically

```typescript
// Good - separate concerns
const toolState = useCanvasTools();
const selectionState = useShapeSelection();
const drawingState = useDrawing();

// Avoid - mixing concerns
const [state, setState] = useState({
  tool: "pen",
  selectedIds: [],
  isDrawing: false,
});
```

### 4. Handle Hook Dependencies

```typescript
// Good - update effect when roomCode changes
useEffect(() => {
  // reconnect socket
}, [roomCode]);

// useSocket handles this internally
const { socketRef } = useSocket(roomCode);
```

## Troubleshooting

### Hook Dependency Issues

If a hook isn't updating, check:

```typescript
// 1. Is roomCode changing?
console.log("Room code:", roomCode);

// 2. Are handlers being called?
const { handleSelectShape } = useShapeSelection();
// Add logging inside handlers

// 3. Check Redux state updates
store.getState().canvas.shapes;
```

### Socket Connection Issues

```typescript
// 1. Verify socket reference
const { socketRef } = useSocket(roomCode);
console.log("Socket:", socketRef.current);
console.log("Connected:", socketRef.current?.connected);

// 2. Check event emissions
socketRef.current?.on("debug", (msg) => console.log(msg));

// 3. Verify event handlers
socketRef.current?.onAny((event, ...args) => {
  console.log("Event:", event, args);
});
```

## Performance Tips

1. **Memoize Callbacks** - Prevent unnecessary hook re-executions
2. **Batch State Updates** - Reduce render cycles
3. **Debounce Socket Events** - Prevent network flooding
4. **Use Selectors** - Only subscribe to needed Redux state
5. **Profile with DevTools** - Identify bottlenecks

## Related

- [React Hooks API](https://react.dev/reference/react)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Zustand Alternative](https://zustand-demo.vercel.app/)
