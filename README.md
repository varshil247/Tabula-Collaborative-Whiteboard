# Collaborative Whiteboard

A high-performance, real-time collaborative drawing application built with React, Node.js, Socket.io, and Supabase.

## 🌟 Key Features
- **Real-time Collaboration**: Synchronized cursors, pen drawing, and shape transformations across all users.
- **Optimized Persistence**: High-frequency changes are cached in-memory and batch-saved to Supabase to maximize database performance.
- **Production-Ready Architecture**: Modular component structure, decoupled business logic (Hooks), and a centralized state management (Redux Toolkit).
- **Graceful Shutdown**: All unsaved changes are flushed to the database on server exit.

## 🏗 Architecture
- **Frontend**: React 19, TypeScript, Konva.js (Canvas), Redux Toolkit, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, Supabase Admin (Service Role).
- **Testing**: Vitest (Client), Jest + Supertest (Server).

## 🚀 Quick Start

1.  **Install All Dependencies**:
    ```bash
    npm run install:all
    ```

2.  **Environment Setup**:
    - **Backend (`server/.env`)**:
      ```env
      SUPABASE_URL=your_url
      SUPABASE_SERVICE_ROLE_KEY=your_service_key
      PORT=3000
      ```
    - **Frontend (`client/.env`)**:
      ```env
      VITE_SUPABASE_URL=your_url
      VITE_SUPABASE_KEY=your_anon_key
      VITE_SERVER_URL=http://localhost:3000
      ```

3.  **Run Development Environment**:
    ```bash
    npm run dev
    ```

## 🧪 Testing

The project includes unit and integration tests for core logic.

```bash
# Run all tests (Frontend & Backend)
npm run test

# Run frontend tests only
npm run test:client

# Run backend tests only
npm run test:server
```

For more details, see the [Testing Guide](./TESTING.md).
