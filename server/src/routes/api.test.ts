import request from "supertest";
import { app } from "../main";
import * as supabaseModule from "../services/supabase";

// Mock Supabase
jest.mock("../services/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
      remove: jest.fn(),
      list: jest.fn(),
    },
  }
}));

describe("API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const s = supabaseModule.supabase as any;
    s.from.mockReturnValue(s);
    s.update.mockReturnValue(s);
    s.eq.mockReturnThis();
    s.storage.from.mockReturnValue(s.storage);
  });

  describe("POST /api/save-thumbnail", () => {
    it("should return 400 if roomCode or dataUrl is missing", async () => {
      const res = await request(app)
        .post("/api/save-thumbnail")
        .send({ roomCode: "test" });
      expect(res.status).toBe(400);
    });

    it("should return 200 on successful thumbnail save", async () => {
      const s = supabaseModule.supabase as any;
      s.storage.upload.mockResolvedValue({ error: null });
      s.storage.getPublicUrl.mockReturnValue({ data: { publicUrl: "http://test.com" } });
      s.eq.mockResolvedValue({ error: null });
      
      const res = await request(app)
        .post("/api/save-thumbnail")
        .send({ 
          roomCode: "testroom", 
          dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" 
        });
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
    });
  });

  describe("DELETE /api/delete-room-storage/:roomId", () => {
    it("should return 400 for invalid roomId format", async () => {
      const res = await request(app).delete("/api/delete-room-storage/short");
      expect(res.status).toBe(400);
    });
  });
});
