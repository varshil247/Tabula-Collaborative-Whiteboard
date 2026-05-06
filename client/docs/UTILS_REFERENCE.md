# Utility Functions Reference Guide

Complete API reference for utility functions in `utils/` directory.

## canvasUtils.ts - Canvas Calculations & Collisions

### calculateContentBounds(shapes)

Calculates the bounding box of all shapes on the canvas.

**Parameters:**

```typescript
shapes: Shape[] - Array of all shapes to measure
```

**Returns:**

```typescript
{
  minX: number,  // Leftmost point
  maxX: number,  // Rightmost point
  minY: number,  // Topmost point
  maxY: number,  // Bottommost point
} | null
```

**Description:**

- Iterates all shapes and finds their boundaries
- Handles pen strokes by checking each point
- Handles rectangles using position + dimensions
- Handles circles/ellipses using center + radius
- Handles polygons (star, triangle, hexagon) using geometry
- Returns null if no shapes or empty canvas

**Usage:**

```typescript
import { calculateContentBounds } from "../utils/canvasUtils";

const bounds = calculateContentBounds(shapes);
if (bounds) {
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  console.log(`Content bounds: ${width}x${height}`);
}
```

**Performance:**

- O(n\*m) where n=shapes, m=avg points per shape
- Suitable for real-time use
- Cache result if called frequently

---

### getShapesInSelectionBox(shapes, box, currentSelection)

Finds all shapes intersecting with a selection box using collision detection.

**Parameters:**

```typescript
shapes: Shape[] - Shapes to check
box: {
  x: number,      // Left edge
  y: number,      // Top edge
  width: number,  // Box width
  height: number, // Box height
}
currentSelection?: string[] - Already selected shape IDs (to toggle)
```

**Returns:**

```typescript
string[] // Array of shape UUIDs that intersect box
```

**Detection Methods by Shape:**

- **Pen**: Check if any point is inside box
- **Rectangle/Text/Image**: Axis-Aligned Bounding Box (AABB)
- **Circle/Ellipse**: Check if center within box OR box intersects bounds
- **Polygons**: Distance-based check to vertices

**Usage:**

```typescript
import { getShapesInSelectionBox } from "../utils/canvasUtils";

const selectionBox = {
  x: startX,
  y: startY,
  width: endX - startX,
  height: endY - startY,
};

const selectedIds = getShapesInSelectionBox(shapes, selectionBox);
setSelectedShapeIds(selectedIds);
```

---

### calculateNewZoom(currentScale, deltaY)

Calculates new zoom level from mouse wheel delta.

**Parameters:**

```typescript
currentScale: number - Current zoom level (1 = 100%)
deltaY: number - Mouse wheel delta (positive = scroll down/zoom out, negative = scroll up/zoom in)
```

**Returns:**

```typescript
number; // New zoom level, clamped to [0.1, 5]
```

**Logic:**

```
newScale = currentScale * (1.1 ^ -sign(deltaY))
// Clamped to [0.1 - 5]
```

**Usage:**

```typescript
import { calculateNewZoom } from "../utils/canvasUtils";

const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  const newScale = calculateNewZoom(stageScale, e.deltaY);
  setStageScale(newScale);
};
```

---

### calculateZoomPosition(pointer, oldScale, newScale, currentX, currentY)

Calculates pan position to keep mouse pointer fixed during zoom.

**Parameters:**

```typescript
pointer: { x: number, y: number } - Mouse position
oldScale: number - Previous zoom level
newScale: number - New zoom level
currentX: number - Current pan X
currentY: number - Current pan Y
```

**Returns:**

```typescript
{ x: number, y: number } // New pan position
```

**Formula:**

```
newX = pointer.x - (pointer.x - currentX) * (newScale / oldScale)
newY = pointer.y - (pointer.y - currentY) * (newScale / oldScale)
```

**Usage:**

```typescript
import { calculateZoomPosition } from "../utils/canvasUtils";

const handleZoom = (pointerPos, newScale) => {
  const newPos = calculateZoomPosition(
    pointerPos,
    stageScale,
    newScale,
    dragState.dragX,
    dragState.dragY,
  );
  setDragState({ dragX: newPos.x, dragY: newPos.y });
  setStageScale(newScale);
};
```

---

### convertMinimapClickToStagePos(clickX, clickY, boardWidth, boardHeight, stageScale)

Converts minimap click coordinates to canvas pan position.

**Parameters:**

```typescript
clickX: number - Click X on minimap
clickY: number - Click Y on minimap
boardWidth: number - Canvas width
boardHeight: number - Canvas height
stageScale: number - Current zoom level
```

**Returns:**

```typescript
{ x: number, y: number } // New pan position for stage
```

**Usage:**

```typescript
import { convertMinimapClickToStagePos } from "../utils/canvasUtils";

const handleMinimapClick = (e) => {
  const newPos = convertMinimapClickToStagePos(
    e.clientX,
    e.clientY,
    800, // canvas width
    600, // canvas height
    stageScale,
  );
  setDragState({ dragX: newPos.x, dragY: newPos.y });
};
```

---

### isPointNearShape(point, shape, threshold)

Checks if a point is near a shape (for hover/selection).

**Parameters:**

```typescript
point: { x: number, y: number } - Test point
shape: Shape - Shape to check
threshold: number = 10 - Distance in pixels
```

**Returns:**

```typescript
boolean; // True if point is within threshold of shape
```

**Detection by Shape:**

- **Pen**: Distance to closest point on any segment
- **Rectangle**: Distance to edge (returns true if inside OR near)
- **Circle**: Distance to center (< radius + threshold)
- **Other**: Distance to center (< threshold)

**Usage:**

```typescript
import { isPointNearShape } from "../utils/canvasUtils";

const handleMouseMove = (e) => {
  const point = { x: e.clientX, y: e.clientY };
  const nearShapes = shapes.filter((s) => isPointNearShape(point, s, 10));
  setHoveredShapes(nearShapes);
};
```

---

## screenshotUtils.ts - Screenshot Capture & Upload

### captureCanvasScreenshot(shapes)

Captures visible canvas content as data URL image.

**Parameters:**

```typescript
shapes: Shape[] - All shapes to render
```

**Returns:**

```typescript
string | null; // Data URL string or null on error
```

**Features:**

- Creates temporary Konva Stage and Layer
- Renders all shape types with correct styling
- Uses 2x pixel ratio for high-DPI displays
- Automatically exports to PNG data URL
- Cleans up DOM after export

**Rendered Shapes:**

- Pen (Line)
- Rectangle (Rect)
- Circle (Circle)
- Ellipse (Ellipse)
- Star (Star)
- Triangle (Polygon)
- Hexagon (Polygon)
- Text (Text)
- _Images: Loaded async if needed_

**Usage:**

```typescript
import { captureCanvasScreenshot } from "../utils/screenshotUtils";

const handleCapture = async () => {
  const dataUrl = captureCanvasScreenshot(shapes);
  if (dataUrl) {
    // Use for preview, download, or upload
    console.log("Screenshot captured:", dataUrl.length, "bytes");
  }
};
```

**Limitations:**

- Doesn't include images (requires async loading)
- Doesn't include effects/filters
- Uses all shapes visible coordinates
- Doesn't respect current zoom/pan

---

### saveScreenshotToSupabase(roomCode, shapes)

Captures screenshot and uploads to Supabase storage.

**Parameters:**

```typescript
roomCode: string - Room identifier for storage path
shapes: Shape[] - Shapes to include in screenshot
```

**Returns:**

```typescript
Promise<boolean>; // True if successful, false on error
```

**Process:**

1. Captures screenshot using `captureCanvasScreenshot()`
2. Converts data URL to blob
3. Uploads to `canvas-images/[roomCode]/thumbnail.png`
4. Retrieves public URL from Supabase
5. Updates room record with thumbnail_url
6. Returns success status

**Usage:**

```typescript
import { saveScreenshotToSupabase } from "../utils/screenshotUtils";

// On component unmount or exit
useEffect(() => {
  return () => {
    saveScreenshotToSupabase(roomCode, shapes).then((success) => {
      if (success) console.log("Screenshot saved");
    });
  };
}, [roomCode, shapes]);
```

**Error Handling:**

- Logs errors to console
- Returns false on failure
- Doesn't throw exceptions
- Graceful fallback if Supabase unavailable

---

## socketUtils.ts - WebSocket Communication

### emitCanvasUpdate(socket, roomCode, state)

Broadcasts full canvas state to all users in room.

**Parameters:**

```typescript
socket: Socket - Socket.io instance
roomCode: string - Room identifier
state: Shape[] - Complete shapes array
```

**Returns:**

```typescript
void
```

**Event Sent:**

```
socket.emit("canvas_update", { roomCode, state })
```

**Usage:**

```typescript
import { emitCanvasUpdate } from "../utils/socketUtils";

const handleShapeAdded = (newShape) => {
  const updatedShapes = [...shapes, newShape];
  dispatch(setCanvasState(updatedShapes));
  emitCanvasUpdate(socketRef.current, roomCode, updatedShapes);
};
```

---

### emitDrawingUpdate(socket, roomCode, line)

Sends active pen stroke for live preview.

**Parameters:**

```typescript
socket: Socket - Socket.io instance
roomCode: string - Room identifier
line: Shape - Drawing line in progress
```

**Returns:**

```typescript
void
```

**Event Sent:**

```
socket.emit("drawing", { roomCode, line })
```

**Usage:**

```typescript
import { emitDrawingUpdate } from "../utils/socketUtils";

const handleMouseMove = (e) => {
  if (!isDrawing) return;
  addPointToLine(e);
  emitDrawingUpdate(socketRef.current, roomCode, currentLine);
};
```

---

### emitObjectUpdate(socket, roomCode, object)

Broadcasts shape transformation (move, rotate, scale).

**Parameters:**

```typescript
socket: Socket - Socket.io instance
roomCode: string - Room identifier
object: any - Updated shape object
```

**Returns:**

```typescript
void
```

**Event Sent:**

```
socket.emit("object_update", { roomCode, object })
```

**Usage:**

```typescript
import { emitObjectUpdate } from "../utils/socketUtils";

const handleShapeTransform = (e) => {
  const transformedShape = e.target;
  emitObjectUpdate(socketRef.current, roomCode, {
    uuid: transformedShape.id(),
    posX: transformedShape.x(),
    posY: transformedShape.y(),
    rotation: transformedShape.rotation(),
  });
};
```

---

### joinRoom(socket, roomCode)

Joins a specific room on the server.

**Parameters:**

```typescript
socket: Socket - Socket.io instance
roomCode: string - Room code to join
```

**Returns:**

```typescript
void
```

**Event Sent:**

```
socket.emit("join_room", { roomCode })
```

**Usage:**

```typescript
import { joinRoom } from "../utils/socketUtils";

useEffect(() => {
  if (roomCode && socketRef.current) {
    joinRoom(socketRef.current, roomCode);
  }
}, [roomCode]);
```

---

### setupSocketListeners(socket, handlers)

Attaches all event listeners to socket.

**Parameters:**

```typescript
socket: Socket - Socket.io instance
handlers: SocketHandlers - Event handler functions

interface SocketHandlers {
  onCanvasState?: (state: Shape[]) => void;
  onCanvasUpdate?: (state: Shape[]) => void;
  onDrawing?: (line: Shape) => void;
  onObjectUpdate?: (object: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}
```

**Returns:**

```typescript
void
```

**Events Registered:**

- `canvas_state` - Sync on join
- `canvas_update` - Remote shape changes
- `drawing` - Live stroke preview
- `object_update` - Transform updates
- `connect` - Connected to server
- `disconnect` - Disconnected
- `error` - Error occurred

**Usage:**

```typescript
import { setupSocketListeners } from "../utils/socketUtils";

const handlers: SocketHandlers = {
  onCanvasState: (state) => setShapes(state),
  onCanvasUpdate: (state) => setShapes(state),
  onDrawing: (line) => addRemoteDrawing(line),
  onObjectUpdate: (obj) => updateRemoteObject(obj),
  onConnect: () => console.log("Connected"),
  onDisconnect: () => console.log("Disconnected"),
  onError: (err) => console.error(err),
};

setupSocketListeners(socketRef.current, handlers);
```

---

### cleanupSocketListeners(socket)

Removes all event listeners to prevent memory leaks.

**Parameters:**

```typescript
socket: Socket - Socket.io instance to clean
```

**Returns:**

```typescript
void
```

**Removes:**

- All `on` listeners
- All `once` listeners
- Prevents duplicate handlers on reconnect

**Usage:**

```typescript
import { cleanupSocketListeners } from "../utils/socketUtils";

useEffect(() => {
  return () => {
    if (socketRef.current) {
      cleanupSocketListeners(socketRef.current);
    }
  };
}, []);
```

---

## Common Patterns

### Combining Utilities

```typescript
import {
  calculateContentBounds,
  captureCanvasScreenshot,
  saveScreenshotToSupabase,
  emitCanvasUpdate,
} from "../utils";

// On session exit
const handleSessionExit = async () => {
  // Verify shapes exist
  const bounds = calculateContentBounds(shapes);
  if (!bounds) return; // Empty canvas

  // Capture screenshot
  const screenshot = captureCanvasScreenshot(shapes);

  // Upload to storage
  const saved = await saveScreenshotToSupabase(roomCode, shapes);

  // Notify others
  emitCanvasUpdate(socket, roomCode, shapes);

  // Leave room
  navigate("/dashboard");
};
```

### Selection & Zoom

```typescript
import {
  getShapesInSelectionBox,
  calculateNewZoom,
  calculateZoomPosition,
} from "../utils/canvasUtils";

const handleSelectionZoom = (selectedShapes) => {
  // Get bounds
  const bounds = calculateContentBounds(selectedShapes);

  // Calculate zoom to fit
  const zoomToFit = Math.min(
    width / (bounds.maxX - bounds.minX),
    height / (bounds.maxY - bounds.minY),
  );

  // Update zoom with pointer fix
  const newPos = calculateZoomPosition(mousePos, stageScale, zoomToFit, panX, panY);
};
```

---

## Performance Considerations

### 1. Memoize Function Calls

```typescript
const bounds = useMemo(() => calculateContentBounds(shapes), [shapes]);
```

### 2. Debounce Socket Emissions

```typescript
const debouncedEmit = useCallback(
  debounce((shapes) => {
    emitCanvasUpdate(socket, roomCode, shapes);
  }, 100),
  [socket, roomCode],
);
```

### 3. Batch Updates

```typescript
// Bad - multiple socket emissions
shapes.forEach(shape => emitObjectUpdate(...));

// Good - single batch update
emitCanvasUpdate(socket, roomCode, shapes);
```

---

## Error Handling

### Safe Screenshot Capture

```typescript
try {
  const screenshot = captureCanvasScreenshot(shapes);
  if (!screenshot) {
    console.warn("Screenshot capture returned null");
    return;
  }
} catch (err) {
  console.error("Screenshot capture failed:", err);
}
```

### Socket Error Handling

```typescript
const handlers: SocketHandlers = {
  onError: (error) => {
    console.error("Socket error:", error);
    // Retry logic or user notification
  },
  onDisconnect: () => {
    console.warn("Socket disconnected");
    // Attempt reconnect
  },
};
```

---

## See Also

- [canvasUtils.ts](/client/src/utils/canvasUtils.ts) - Source code
- [screenshotUtils.ts](/client/src/utils/screenshotUtils.ts) - Source code
- [socketUtils.ts](/client/src/utils/socketUtils.ts) - Source code
- [Constants Reference](./CONSTANTS_REFERENCE.md)
- [Hooks Guide](./HOOKS_GUIDE.md)
