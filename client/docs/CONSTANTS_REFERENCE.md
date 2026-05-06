# Constants Reference Guide

Quick lookup guide for all application constants defined in `utils/constants.ts`.

## Canvas Configuration

### CANVAS Object

```typescript
{
  MINIMAP_SCALE: 0.04,           // 4% of canvas size
  MINIMAP_WIDTH: 140,            // px
  MINIMAP_HEIGHT: 90,            // px
  ZOOM_MIN: 0.1,                 // 10%
  ZOOM_MAX: 5,                   // 500%
  ZOOM_STEP: 1.1,                // Zoom factor per wheel event
  GRID_SIZE: 24,                 // px
  SCREENSHOT_PADDING: 40,        // px around content
  PIXEL_RATIO: 2,                // For high-DPI displays
}
```

**Usage:**

```typescript
import { CANVAS } from "../utils/constants";

const minimapScale = CANVAS.MINIMAP_SCALE; // 0.04
const zoomRange = [CANVAS.ZOOM_MIN, CANVAS.ZOOM_MAX]; // [0.1, 5]
```

## Tool Identifiers

### TOOLS Object

```typescript
{
  SELECT: "select",              // Selection cursor
  PEN: "pen",                    // Freehand drawing
  ERASER: "eraser",              // Erase strokes
  TEXT: "text",                  // Text boxes
  RECTANGLE: "rectangle",        // Rectangle shape
  CIRCLE: "circle",              // Circle shape
  ELLIPSE: "ellipse",            // Ellipse shape
  STAR: "star",                  // Star shape
  TRIANGLE: "triangle",          // Triangle shape
  HEXAGON: "hexagon",            // Hexagon shape
}
```

**Usage:**

```typescript
import { TOOLS } from "../utils/constants";

if (activeTool === TOOLS.PEN) {
  // Handle pen tool
}

const isShapeTool = [TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.STAR].includes(activeTool);
```

## Shape Types

### SHAPES Object

```typescript
{
  PEN: "pen",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  ELLIPSE: "ellipse",
  STAR: "star",
  TRIANGLE: "triangle",
  HEXAGON: "hexagon",
  TEXT: "text",
  IMAGE: "image",
}
```

**Usage:**

```typescript
import { SHAPES } from "../utils/constants";

switch (shape.shape) {
  case SHAPES.PEN:
    renderPen(shape);
    break;
  case SHAPES.RECTANGLE:
    renderRectangle(shape);
    break;
  // ...
}
```

## Color Palette

### COLORS Array

```typescript
[
  "#000000", // Black (index 0)
  "#FFFFFF", // White (index 1)
  "#EF4444", // Red (index 2)
  "#F97316", // Orange (index 3)
  "#EAB308", // Yellow (index 4)
  "#22C55E", // Green (index 5)
  "#3B82F6", // Blue (index 6)
  "#A855F7", // Purple (index 7)
];
```

**Usage:**

```typescript
import { COLORS } from "../utils/constants";

const defaultColor = COLORS[0];     // Black
const color = COLORS[Math.random() * COLORS.length];

// In color picker
<input type="color" value={COLORS[index]} />
```

## WebSocket Configuration

### SOCKET Object

```typescript
{
  URL: "http://localhost:3000",
  EVENTS: {
    JOIN_ROOM: "join_room",
    CANVAS_STATE: "canvas_state",
    CANVAS_UPDATE: "canvas_update",
    DRAWING: "drawing",
    OBJECT_UPDATE: "object_update",
  },
}
```

**Usage:**

```typescript
import { SOCKET } from "../utils/constants";

const socket = io(SOCKET.URL);
socket.emit(SOCKET.EVENTS.JOIN_ROOM, { roomCode });
socket.on(SOCKET.EVENTS.CANVAS_UPDATE, handleUpdate);
```

## Eraser Configuration

### ERASER Object

```typescript
{
  RADIUS: 15,                    // px erase radius
  COLOR: "#EF4444",              // Visual indicator color
  OPACITY: 0.2,                  // Preview opacity
}
```

**Usage:**

```typescript
import { ERASER } from "../utils/constants";

const eraserRadius = ERASER.RADIUS; // 15px
// Show eraser preview circle at mouse position
```

## Selection Configuration

### SELECTION Object

```typescript
{
  STROKE_WIDTH: 2,               // Border width
  STROKE_COLOR: "#3B82F6",       // Border color (blue)
  STROKE_DASH: [5, 5],           // Dashed pattern
  MIN_BOX_SIZE: 5,               // Minimum box size to register
}
```

**Usage:**

```typescript
import { SELECTION } from "../utils/constants";

const selectedStyle = {
  stroke: SELECTION.STROKE_COLOR,
  strokeWidth: SELECTION.STROKE_WIDTH,
  strokeScaleEnabled: false,
};
```

## Text Defaults

### TEXT_DEFAULTS Object

```typescript
{
  FONT_SIZE: 28,                 // px
  FONT_FAMILY: "Arial, sans-serif",
  DEFAULT_TEXT: "Double click to edit",
}
```

**Usage:**

```typescript
import { TEXT_DEFAULTS } from "../utils/constants";

const textConfig = {
  fontSize: TEXT_DEFAULTS.FONT_SIZE,
  fontFamily: TEXT_DEFAULTS.FONT_FAMILY,
  text: newText || TEXT_DEFAULTS.DEFAULT_TEXT,
};
```

## Shape Defaults

### SHAPE_DEFAULTS Object

```typescript
{
  pen: { strokeWidth: 2 },
  rectangle: { width: 100, height: 100 },
  circle: { radius: 50 },
  ellipse: { radiusX: 75, radiusY: 50 },
  star: { numPoints: 5, innerRadius: 20, outerRadius: 50 },
  triangle: { numPoints: 3, radius: 50 },
  hexagon: { numPoints: 6, radius: 50 },
  text: { fontSize: 28, text: "Double click to edit" },
  image: { width: 200, height: 150 },
}
```

**Usage:**

```typescript
import { SHAPE_DEFAULTS } from "../utils/constants";

const newShape = {
  uuid: generateUUID(),
  shape: "rectangle",
  posX: 0,
  posY: 0,
  config: SHAPE_DEFAULTS.rectangle,
};
```

## Animation Durations

### ANIMATION Object

```typescript
{
  DURATION_SHORT: 200,           // ms - quick feedback
  DURATION_MEDIUM: 500,          // ms - normal animation
  DURATION_LONG: 1000,           // ms - smooth animation
}
```

**Usage:**

```typescript
import { ANIMATION } from "../utils/constants";

// Menu open animation
transitionDuration: `${ANIMATION.DURATION_SHORT}ms`;

// Shape appear animation
animationDuration: `${ANIMATION.DURATION_MEDIUM}ms`;
```

## File Upload Configuration

### FILE_UPLOAD Object

```typescript
{
  BUCKET: "canvas-images",
  FILENAME: "thumbnail.png",
}
```

**Usage:**

```typescript
import { FILE_UPLOAD } from "../utils/constants";

const uploadPath = `${roomCode}/${FILE_UPLOAD.FILENAME}`;
await supabase.storage.from(FILE_UPLOAD.BUCKET).upload(uploadPath, blob, { upsert: true });
```

## History Action Types

### HISTORY_TYPES Object

```typescript
{
  CREATE: "CREATE",              // New shape created
  DRAW: "DRAW",                  // Pen stroke completed
  TRANSFORM: "TRANSFORM",        // Shape rotated/scaled
  MOVE: "MOVE",                  // Shape moved
  DELETE: "DELETE",              // Single shape deleted
  DELETE_MULTI: "DELETE_MULTI",  // Multiple shapes deleted
  ERASE_BATCH: "ERASE_BATCH",    // Erased multiple segments
  EDIT: "EDIT",                  // Text or config edited
  CLEAR: "CLEAR",                // Canvas cleared
}
```

**Usage:**

```typescript
import { HISTORY_TYPES } from "../utils/constants";

function addToHistory(type, details) {
  historyStack.push({
    type: HISTORY_TYPES[type],
    timestamp: Date.now(),
    ...details,
  });
}

// Later, for undo
if (lastHistory.type === HISTORY_TYPES.CREATE) {
  removeShape(lastHistory.shapeId);
}
```

## Common Patterns

### Import Multiple Constants

```typescript
import { CANVAS, TOOLS, SHAPES, COLORS, SOCKET, ANIMATION } from "../utils/constants";
```

### Conditional Logic

```typescript
import { TOOLS, SHAPES } from "../utils/constants";

// Check if shape tool
const isShapeTool = [
  TOOLS.RECTANGLE,
  TOOLS.CIRCLE,
  TOOLS.ELLIPSE,
  TOOLS.STAR,
  TOOLS.TRIANGLE,
  TOOLS.HEXAGON,
].includes(activeTool);

// Check if drawable
const isDrawableTool = [TOOLS.PEN, TOOLS.ERASER, ...drawingTools].includes(activeTool);
```

### Configuration Objects

```typescript
import { CANVAS, TOOLS, COLORS } from "../utils/constants";

const canvasConfig = {
  zoomRange: [CANVAS.ZOOM_MIN, CANVAS.ZOOM_MAX],
  gridSize: CANVAS.GRID_SIZE,
  minimapScale: CANVAS.MINIMAP_SCALE,
};

const toolbarConfig = {
  tools: [TOOLS.SELECT, TOOLS.PEN, TOOLS.ERASER, TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.TEXT],
  colors: COLORS,
};
```

## Performance Tips

1. **Avoid Inline Constants** - Import from utils instead:

   ```typescript
   // ❌ Bad - creates new reference each render
   const zoom = [0.1, 5];

   // ✅ Good - reference is stable
   const zoomRange = [CANVAS.ZOOM_MIN, CANVAS.ZOOM_MAX];
   ```

2. **Use in Default Props** - Reuse references:

   ```typescript
   const getPenConfig = useCallback(
     () => ({
       color: COLORS[0],
       thickness: 3,
     }),
     [],
   );
   ```

3. **Memoize Based on Constants** - Constants never change:
   ```typescript
   const toolList = useMemo(
     () => [TOOLS.PEN, TOOLS.ERASER, TOOLS.TEXT],
     [], // Empty deps - constants don't change
   );
   ```

## Updating Constants

When modifying constants:

1. **Update utils/constants.ts** - Only source of truth
2. **Import from utils** - Never duplicate
3. **Run tests** - Verify all references work
4. **Update documentation** - This file

### Adding New Constant

```typescript
// 1. Add to appropriate object or create new
export const NEW_FEATURE = {
  SETTING_1: "value",
  SETTING_2: 42,
};

// 2. Document usage
// In comments or this guide

// 3. Use consistently
import { NEW_FEATURE } from "../utils/constants";
const value = NEW_FEATURE.SETTING_1;
```

## See Also

- [utils/constants.ts](/client/src/utils/constants.ts) - Source definitions
- [README.md](/client/README.md) - Architecture overview
- [SETUP.md](/client/SETUP.md) - Configuration guide
