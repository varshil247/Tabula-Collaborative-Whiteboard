/**
 * Application configuration
 * Environment-specific settings and feature flags
 */

// API Configuration
export const API_CONFIG = {
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || "http://localhost:3000",
  SOCKET_TIMEOUT: 5000,
  RECONNECT_ATTEMPTS: 10,
  RECONNECT_DELAY: 1000,
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  BUCKET_NAME: "canvas-images",
  THUMBNAIL_PATH: "thumbnail.png",
  THUMBNAIL_QUALITY: 0.9,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

// Canvas Configuration
export const CANVAS_CONFIG = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5,
  ZOOM_STEP: 1.1,
  DEFAULT_ZOOM: 1,
  GRID_SIZE: 24,
  PIXEL_RATIO: 2,
};

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 100,
  THROTTLE_DELAY: 50,
  ANIMATION_DURATION_SHORT: 200,
  ANIMATION_DURATION_MEDIUM: 500,
  ANIMATION_DURATION_LONG: 1000,
};

// Toolbar Configuration
export const TOOLBAR_CONFIG = {
  TOOLS_PER_ROW: 6,
  BUTTON_SIZE: 40,
  BUTTON_GAP: 8,
  ICON_SIZE: 20,
};

// Editor Configuration
export const EDITOR_CONFIG = {
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  HISTORY_MAX_SIZE: 100,
  UNDO_REDO_STEP_LIMIT: 50,
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_COLLABORATIVE_CURSORS: true,
  ENABLE_ANNOTATIONS: false,
  ENABLE_VOICE_CHAT: false,
  ENABLE_SHAPES_LIBRARY: false,
  ENABLE_CUSTOM_BRUSHES: false,
  ENABLE_FILTERS: false,
  ENABLE_LAYERS: false,
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
  SIDEBAR_WIDTH: 280,
  MINIMAP_WIDTH: 140,
  MINIMAP_HEIGHT: 90,
};

// Development Configuration
export const DEV_CONFIG = {
  DEBUG_MODE: process.env.NODE_ENV === "development",
  LOG_SOCKET_EVENTS: false,
  LOG_REDUX_ACTIONS: false,
  LOG_RENDER_PERFORMANCE: false,
  MOCK_REMOTE_USERS: false,
};

// Export all configs
export const CONFIG = {
  API: API_CONFIG,
  SUPABASE: SUPABASE_CONFIG,
  CANVAS: CANVAS_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
  TOOLBAR: TOOLBAR_CONFIG,
  EDITOR: EDITOR_CONFIG,
  FEATURES: FEATURE_FLAGS,
  UI: UI_CONFIG,
  DEV: DEV_CONFIG,
};
