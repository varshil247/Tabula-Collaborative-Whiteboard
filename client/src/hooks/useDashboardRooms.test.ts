import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDashboardRooms } from "./useDashboardRooms";
import { supabase } from "../backend/createClient";

// Mock dependencies
vi.mock("../backend/createClient", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn(),
  },
}));

vi.mock("react-redux", () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector: any) => selector({
    user: { user: { user_id: "test-user" } },
    rooms: { hostedRooms: [], joinedRooms: [], isLoading: false, error: null }
  }),
}));

describe("useDashboardRooms Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a room successfully", async () => {
    (supabase.from("rooms").insert as any).mockResolvedValue({ error: null });
    
    const { result } = renderHook(() => useDashboardRooms());

    await act(async () => {
      const roomCode = await result.current.createRoom("My New Room");
      expect(roomCode).toBeDefined();
      expect(roomCode?.length).toBe(8);
    });
  });

  it("should handle room creation failure", async () => {
    (supabase.from("rooms").insert as any).mockResolvedValue({ 
      error: { message: "DB Error" } 
    });
    
    const { result } = renderHook(() => useDashboardRooms());

    await act(async () => {
      const roomCode = await result.current.createRoom("Fail Room");
      expect(roomCode).toBeNull();
    });
  });
});
