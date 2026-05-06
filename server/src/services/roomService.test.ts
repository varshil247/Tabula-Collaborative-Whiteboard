import { getRoomState, updateRoomState } from "./roomService";
import * as supabaseModule from "./supabase";

// Mock Supabase
jest.mock("./supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
  }
}));

describe("Room Service", () => {
  const roomCode = "test-room";
  const mockShapes = [{ uuid: "1", shape: "rect" }];

  beforeEach(() => {
    jest.clearAllMocks();
    const s = supabaseModule.supabase as any;
    s.from.mockReturnValue(s);
    s.select.mockReturnValue(s);
    s.eq.mockReturnValue(s);
  });

  describe("getRoomState", () => {
    it("should fetch state from Supabase if not in cache", async () => {
      const s = supabaseModule.supabase as any;
      s.single.mockResolvedValue({
        data: { canvas_state: mockShapes },
        error: null,
      });

      const state = await getRoomState(roomCode);
      expect(state).toEqual(mockShapes);
      expect(s.from).toHaveBeenCalledWith("rooms");
    });

    it("should return empty array if room not found", async () => {
      const s = supabaseModule.supabase as any;
      s.single.mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const state = await getRoomState("new-room");
      expect(state).toEqual([]);
    });
  });

  describe("updateRoomState", () => {
    it("should update memory cache and mark as dirty", () => {
      updateRoomState(roomCode, mockShapes);
    });
  });
});
