import { Request, Response } from "express";
import { supabase } from "../services/supabase";
import { catchAsync, AppError } from "../utils/errorHandler";

/**
 * Controller for canvas-related API operations
 */
export class CanvasController {
  /**
   * Saves a base64 canvas thumbnail to Supabase storage
   */
  static saveThumbnail = catchAsync(async (req: Request, res: Response) => {
    const { roomCode, dataUrl } = req.body;
    
    // Security: Validate inputs
    if (!roomCode || typeof roomCode !== "string") {
      throw new AppError("A valid roomCode is required", 400);
    }
    if (!dataUrl || !dataUrl.startsWith("data:image/png;base64,")) {
      throw new AppError("A valid base64 PNG dataUrl is required", 400);
    }

    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Security: Limit file size (approx 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      throw new AppError("Thumbnail size exceeds limit", 413);
    }

    const fileName = `${roomCode}/thumbnail.png`;

    const { error: uploadError } = await supabase.storage
      .from("canvas-images")
      .upload(fileName, buffer, {
        upsert: true,
        contentType: "image/png",
      });

    if (uploadError) throw new AppError(`Upload failed: ${uploadError.message}`, 500);

    const { data: publicUrlData } = supabase.storage.from("canvas-images").getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from("rooms")
      .update({
        thumbnail_url: publicUrlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roomCode);

    if (updateError) throw new AppError(`Database update failed: ${updateError.message}`, 500);

    res.status(200).json({ status: "success", url: publicUrlData.publicUrl });
  });

  /**
   * Deletes a batch of images from storage
   */
  static deleteImages = catchAsync(async (req: Request, res: Response) => {
    const { paths } = req.body;
    
    if (!paths || !Array.isArray(paths)) {
      throw new AppError("Missing or invalid paths array", 400);
    }

    if (paths.length === 0) {
      return res.status(200).json({ status: "success" });
    }

    // Security: Basic path validation
    const invalidPath = paths.find(p => typeof p !== "string" || p.includes(".."));
    if (invalidPath) {
      throw new AppError("Invalid path detected", 400);
    }

    const { error: removeError } = await supabase.storage.from("canvas-images").remove(paths);
    if (removeError) throw new AppError(`Remove failed: ${removeError.message}`, 500);

    res.status(200).json({ status: "success" });
  });

  /**
   * Deletes all storage associated with a specific room (purges the folder)
   */
  static deleteRoomStorage = catchAsync(async (req: Request, res: Response) => {
    const roomId = req.params.roomId as string;
    
    if (!roomId || !/^[a-zA-Z0-9_-]{8,21}$/.test(roomId)) {
      throw new AppError("Invalid or missing roomId", 400);
    }

    // Supabase doesn't have "folders", only prefixes. To delete a folder, 
    // we must list all files with the room prefix and remove them.
    const { data: list, error: listError } = await supabase.storage
      .from("canvas-images")
      .list(roomId, { limit: 1000 }); // Increase limit to ensure full purge

    if (listError) throw new AppError(`Storage list failed: ${listError.message}`, 500);

    if (list && list.length > 0) {
      const filesToRemove = list.map((x) => `${roomId}/${x.name}`);
      const { error: removeError } = await supabase.storage.from("canvas-images").remove(filesToRemove);
      if (removeError) throw new AppError(`Storage purge failed: ${removeError.message}`, 500);
      
      console.log(`🧹 Purged ${filesToRemove.length} files for room: ${roomId}`);
    }

    res.status(200).json({ status: "success" });
  });
}
