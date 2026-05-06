import express, { Express } from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import * as dotenv from "dotenv";
import { execSync } from "child_process";

import apiRoutes from "./routes/api";
import { setupSocketHandlers } from "./sockets/socketManager";
import { startBatchSaveJob, flushAllRooms } from "./services/roomService";
import { globalErrorHandler } from "./utils/errorHandler";

// Load environment variables
dotenv.config();

/**
 * Real-time Collaborative Whiteboard Server
 * Handles WebSocket communication, HTTP APIs, and state persistence
 */

// Verify critical configuration
if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY)) {
  console.error("❌ CRITICAL: Missing Supabase credentials in environment variables (URL and Key required).");
  process.exit(1);
}

export const app: Express = express();

// --- Middleware ---
app.use(cors());
// Increase limit for handling base64 image data payloads (canvas thumbnails)
app.use(express.json({ limit: "50mb" }));

// --- API Routes ---
app.use("/api", apiRoutes);

// --- Global Error Handler ---
app.use(globalErrorHandler);

// --- Server Initialization ---
const server = http.createServer(app);

// Initialize Socket.io with permissive CORS for development
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

// Setup collaborative event handlers
setupSocketHandlers(io);

// --- Start Server ---
const PORT: number = parseInt(process.env.PORT || "3000", 10);
let activeServer: http.Server | null = null;

/**
 * Starts the server on the specified port.
 * If the port is in use, it attempts to kill the occupying process and retries.
 */
const startServer = (port: number) => {
  const instance = server.listen(port);

  instance.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️  Port ${port} is in use. Attempting to clear it...`);
      try {
        // Attempt to force kill the process on the target port (Linux/macOS)
        execSync(`fuser -k ${port}/tcp 2>/dev/null || (lsof -t -i:${port} | xargs kill -9 2>/dev/null)`);
        console.log(`✅ Port ${port} cleared. Retrying in 1s...`);
        setTimeout(() => startServer(port), 1000);
      } catch (killErr) {
        console.error(`❌ Failed to clear port ${port}. Please clear it manually or check permissions.`);
        process.exit(1);
      }
    } else {
      console.error("❌ Failed to start server:", err);
      process.exit(1);
    }
  });

  instance.on("listening", () => {
    console.log(`🚀 Whiteboard Server running on port ${port}`);
    activeServer = instance;
  });
};

// Start the periodic background task and the server (only if run directly)
if (require.main === module) {
  startBatchSaveJob();
  startServer(PORT);
}

/**
 * Graceful Shutdown handling
 * Ensures all unsaved canvas states are persisted before the process exits
 */
const handleShutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");
  
  // Persist all remaining dirty states
  await flushAllRooms();
  
  if (activeServer) {
    activeServer.close(() => {
      console.log("👋 Server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Listen for termination signals
process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);
