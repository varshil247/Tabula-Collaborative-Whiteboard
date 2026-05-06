# Collaborative Whiteboard - Backend

Real-time Node.js + Express server with Socket.io for collaborative drawing and state persistence.

## 🏗 Architecture

The backend implements a high-performance **Controller-Service-Socket** pattern:

- **Socket.io**: Low-latency event broadcasting (cursors, drawing, transformations).
- **Write-Behind Cache**: In-memory store for active room states to optimize database writes.
- **Batch Save Job**: Periodic task (60s) that persists only "dirty" rooms to Supabase.
- **Graceful Shutdown**: Automatically flushes all remaining memory state to the DB on exit.

## 📁 Directory Structure

```
server/src/
├── controllers/         # API Controllers
│   └── canvasController.ts  # Image storage & thumbnail management
│
├── services/            # Business Logic
│   ├── roomService.ts   # State persistence & caching
│   └── supabase.ts      # Administrative DB client
│
├── sockets/             # Real-time Events
│   └── socketManager.ts # Socket event routing
│
├── utils/               # Helpers
│   └── errorHandler.ts  # Global error middleware
│
└── main.ts              # Server entry point
```

## 🧪 Testing

We use **Jest** and **Supertest** for testing endpoints and services.

### Core Test Suites
- **`roomService.test.ts`**: Tests for the caching and persistence logic.
- **`api.test.ts`**: Tests for REST API endpoints.

### Commands
```bash
npm test                 # Run all tests
npm test -- --watch      # Run in watch mode
```

## 🚀 Getting Started

1.  **Install dependencies**: `npm install`
2.  **Environment Setup**: Create a `.env` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3.  **Start Development**: `npm run dev`
