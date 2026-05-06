# Testing Guide

This project uses a comprehensive testing strategy covering both the frontend and backend.

## Frontend Testing (Vitest)

The frontend uses [Vitest](https://vitest.dev/) for unit and integration testing of hooks, utilities, and components.

### Core Test Suites
- **`canvasUtils.test.ts`**: Tests for geometric calculations, zoom logic, and bounding box detection.
- **`useAuth.test.ts`**: Tests for authentication logic (Login/Register) using mocked Supabase.
- **`useDashboardRooms.test.ts`**: Tests for room management logic (Create/Join/Delete).

### Run Commands
```bash
# Navigate to client directory
cd client

# Run all tests
npm run test

# Run tests in UI mode (Interactive)
npm run test:ui

# Generate coverage report
npm run test:coverage
```

---

## Backend Testing (Jest)

The backend uses [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest) for testing API endpoints and business logic.

### Core Test Suites
- **`roomService.test.ts`**: Tests for the in-memory cache and write-behind persistence logic.
- **`api.test.ts`**: Integration tests for Express routes and controllers.

### Run Commands
```bash
# Navigate to server directory
cd server

# Run all tests
npm test

# Run tests with watch mode
npm test -- --watch
```

---

## Real-time Backend Testing

Real-time interactions are tested manually using the "Dual-Client" method:
1. Open two browser windows at `http://localhost:5173`.
2. Log in as different users.
3. Verify that:
   - Cursors are visible and smooth.
   - Pen strokes appear instantly as you draw.
   - Shape transformations (Resize/Rotate) update in real-time.
   - Text typing is reflected live.

## Design Patterns & Best Practices

- **Mocking**: Both frontend and backend tests use extensive mocking of external services (Supabase, WebSockets) to ensure isolation and speed.
- **Pure Functions**: Core logic is extracted into pure functions (in `utils/`) which are tested without dependencies.
- **Async Handling**: Tests utilize `act()` on the frontend and `catchAsync` on the backend to handle asynchronous state changes reliably.
