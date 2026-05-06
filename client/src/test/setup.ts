import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Canvas/Konva related globals if necessary
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
