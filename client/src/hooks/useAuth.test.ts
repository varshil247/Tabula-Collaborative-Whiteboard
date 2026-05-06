import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "./useAuth";
import { supabase } from "../backend/createClient";

// Mock dependencies
vi.mock("../backend/createClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("react-redux", () => ({
  useDispatch: () => vi.fn(),
}));

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle successful sign in", async () => {
    const mockUser = { id: "123", email: "test@example.com" };
    const mockSession = { access_token: "token" };
    
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.signIn("test@example.com", "password");
      expect(success).toBe(true);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toBe("");
  });

  it("should handle sign in failure", async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid credentials" },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.signIn("test@example.com", "wrong");
      expect(success).toBe(false);
    });

    expect(result.current.errorMessage).toBe("Invalid credentials");
  });
});
