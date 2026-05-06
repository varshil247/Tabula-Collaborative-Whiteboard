import { Router } from "express";
import { CanvasController } from "../controllers/canvasController";

/**
 * Express router for API endpoints
 * Mounts controller methods to specific routes
 */
const router = Router();

// --- Canvas & Storage Routes ---

/**
 * @route POST /api/save-thumbnail
 * @desc Saves a room's canvas thumbnail to storage
 */
router.post("/save-thumbnail", CanvasController.saveThumbnail);

/**
 * @route POST /api/delete-images
 * @desc Deletes specific image assets from storage
 */
router.post("/delete-images", CanvasController.deleteImages);

/**
 * @route DELETE /api/delete-room-storage/:roomId
 * @desc Deletes all storage assets associated with a room
 */
router.delete("/delete-room-storage/:roomId", CanvasController.deleteRoomStorage);

export default router;
