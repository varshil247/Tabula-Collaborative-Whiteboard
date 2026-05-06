# Collaborative Whiteboard - Frontend

Professional React + TypeScript collaborative drawing application with real-time synchronization and a modular, hook-based architecture.

## 🏗 Architecture

The frontend is built for performance and maintainability:

- **Redux Toolkit**: Centralized state management for users, rooms, and the canvas.
- **Custom Hooks**: Business logic is decoupled from UI components.
- **Konva.js**: High-performance canvas rendering engine.
- **Socket.io-client**: Low-latency real-time collaboration.

## 📁 Directory Structure

```
client/src/
├── components/          # UI Components
│   ├── dashboard/       # Dashboard sub-components (e.g. RoomCard)
│   ├── whiteboard/      # Canvas sub-components (e.g. Toolbar, Minimap)
│   └── common/          # Global UI (e.g. Navbar)
│
├── hooks/               # Core Logic (Hooks)
│   ├── useAuth.ts       # Authentication logic
│   ├── useSocket.ts     # WebSocket synchronization
│   ├── useDrawing.ts    # Pen tool management
│   └── useHistory.ts    # Undo/Redo management
│
├── redux/               # State Management
│   ├── slices/          # Feature-based Redux slices
│   └── store.ts         # Central Redux store
│
├── utils/               # Utilities
│   ├── canvasUtils.ts   # Geometric calculations
│   └── constants.ts     # Central configuration
│
└── pages/               # Main Page Views
    ├── dashboard.tsx    # User Workspace
    └── room.tsx         # Canvas Interface
```

## 🧪 Testing

We use **Vitest** for unit and integration testing.

### Core Test Suites
- **`canvasUtils.test.ts`**: Tests for geometric logic.
- **`useAuth.test.ts`**: Tests for authentication flows.
- **`useDashboardRooms.test.ts`**: Tests for room management.

### Commands
```bash
npm run test           # Run all tests
npm run test:ui        # Interactive test runner
npm run test:coverage  # Generate coverage reports
```

## 🚀 Getting Started

1.  **Install dependencies**: `npm install`
2.  **Environment Setup**: Create a `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`.
3.  **Start Development**: `npm run dev`
