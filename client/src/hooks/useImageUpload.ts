/**
 * Custom hook for handling image uploads to Supabase
 * Manages storage and canvas object creation
 */

import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../backend/createClient";
import { FILE_UPLOAD } from "../utils/constants";

/**
 * Hook for managing image upload operations
 * @returns Object with upload handler
 */
export const useImageUpload = () => {
  /**
   * Uploads an image to Supabase storage and returns the shape data
   * @param file - The file object from input change event
   * @param roomCode - The current room code for storage path
   * @param pointerPos - Current pointer position to place the image
   * @returns Promise resolving to the new image shape or null if failed
   */
  const uploadImage = useCallback(
    async (file: File, roomCode: string | null, pointerPos: { x: number; y: number }) => {
      if (!file || !roomCode) return null;

      const fileId = uuidv4();
      const fileExt = file.name.split(".").pop();
      const fileName = `${roomCode}/${fileId}.${fileExt}`;

      try {
        const { error } = await supabase.storage.from(FILE_UPLOAD.STORAGE_BUCKET).upload(fileName, file);
        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from(FILE_UPLOAD.STORAGE_BUCKET).getPublicUrl(fileName);

        // Calculate position to center image at pointer
        const posX = pointerPos.x - 125;
        const posY = pointerPos.y - 125;

        return {
          uuid: fileId,
          shape: "image",
          posX,
          posY,
          config: {
            url: publicUrl,
            storagePath: fileName,
            width: 250,
            height: 250,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
          },
        };
      } catch (err) {
        console.error("Upload failed:", err);
        return null;
      }
    },
    [],
  );

  return { uploadImage };
};
