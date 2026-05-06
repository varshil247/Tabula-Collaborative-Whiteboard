import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../backend/createClient";
import {
  setLoading,
  setError,
  setRoomsData,
  updateRoomTitle as updateRoomTitleAction,
  removeHostedRoom,
  removeJoinedRoom,
  type RoomData,
} from "../redux/slices/roomsSlice";
import { nanoid } from "nanoid";

/**
 * Custom hook for managing rooms on the dashboard
 * Handles fetching, creating, joining, updating, and deleting rooms
 */
export const useDashboardRooms = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.user);
  const userId = user?.user_id || user?.user?.user_id;

  const { hostedRooms, joinedRooms, isLoading, error } = useSelector(
    (state: any) => state.rooms || { hostedRooms: [], joinedRooms: [], isLoading: true, error: null },
  );

  /**
   * Fetches all rooms (hosted and joined) for the current user
   */
  const retrieveRoomsData = useCallback(async () => {
    if (!userId) {
      dispatch(setLoading(false));
      return;
    }

    dispatch(setLoading(true));
    try {
      // 1. Fetch Hosted Rooms
      const { data: hostedData, error: hostedError } = await supabase
        .from("rooms")
        .select()
        .eq("host_id", userId)
        .order("updated_at", { ascending: false });

      if (hostedError) throw hostedError;

      const formattedHosted: RoomData[] = (hostedData || []).map((r) => ({
        ...r,
        currentUserRole: "host",
      }));

      // 2. Fetch Joined Rooms
      const { data: participantData, error: participantError } = await supabase
        .from("room_participants")
        .select(`
          room_id,
          rooms!inner (
            id,
            title,
            host_id,
            updated_at,
            thumbnail_url
          )
        `)
        .eq("user_id", userId);

      if (participantError) throw participantError;

      let formattedJoined: RoomData[] = [];

      if (participantData && participantData.length > 0) {
        const rawJoined = participantData.map((p: any) => p.rooms);
        const hostIds = [...new Set(rawJoined.map((r: any) => r.host_id))];

        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", hostIds);

        const profileMap: Record<string, string> = {};
        if (profilesData) {
          profilesData.forEach((p) => {
            profileMap[p.id] = p.username;
          });
        }

        formattedJoined = rawJoined.map((r: any) => ({
          ...r,
          host_name: profileMap[r.host_id] || "Unknown User",
          currentUserRole: "guest",
        }));

        formattedJoined.sort(
          (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime(),
        );
      }

      dispatch(setRoomsData({ hosted: formattedHosted, joined: formattedJoined }));
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to load rooms"));
    } finally {
      dispatch(setLoading(false));
    }
  }, [userId, dispatch]);

  /**
   * Creates a new whiteboard room
   */
  const createRoom = useCallback(async (title: string) => {
    if (!userId) return null;

    for (let i = 0; i < 5; i++) {
      try {
        const roomCode = nanoid(8);
        const finalTitle = title.trim() || `Untitled Room`;
        const newRoom = {
          id: roomCode,
          title: finalTitle,
          host_id: userId,
        };

        const { error: insertError } = await supabase.from("rooms").insert(newRoom);

        if (insertError?.code === "23505") continue;
        if (insertError) throw insertError;

        await retrieveRoomsData();
        return roomCode;
      } catch (err: any) {
        dispatch(setError(err.message || "Failed to create room"));
        return null;
      }
    }
    return null;
  }, [userId, retrieveRoomsData, dispatch]);

  /**
   * Joins an existing room by its code
   */
  const joinRoom = useCallback(async (code: string) => {
    if (!userId || !code) return null;

    try {
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("id, host_id")
        .eq("id", code)
        .single();

      if (roomError || !roomData) {
        throw new Error("Room not found. Please check the code.");
      }

      if (roomData.host_id === userId) return code;

      const { data: existingParticipant } = await supabase
        .from("room_participants")
        .select("room_id")
        .eq("room_id", code)
        .eq("user_id", userId)
        .single();

      if (!existingParticipant) {
        const { error: insertError } = await supabase.from("room_participants").insert({
          room_id: code,
          user_id: userId,
          role: "editor",
        });

        if (insertError) throw insertError;
      }

      await retrieveRoomsData();
      return code;
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to join room."));
      return null;
    }
  }, [userId, retrieveRoomsData, dispatch]);

  /**
   * Updates a room's title (with optimistic UI)
   */
  const updateRoomTitle = useCallback(async (room: RoomData, newTitle: string) => {
    const trimmedName = newTitle.trim();
    if (!trimmedName || trimmedName === room.title) return;

    const updatedDate = new Date().toISOString();
    const isHost = room.currentUserRole === "host";

    dispatch(
      updateRoomTitleAction({
        id: room.id,
        title: trimmedName,
        updated_at: updatedDate,
        isHost,
      }),
    );

    try {
      const { error: updateError } = await supabase
        .from("rooms")
        .update({ title: trimmedName, updated_at: updatedDate })
        .eq("id", room.id);

      if (updateError) throw updateError;
    } catch (err: any) {
      dispatch(
        updateRoomTitleAction({
          id: room.id,
          title: room.title,
          updated_at: room.updated_at || updatedDate,
          isHost,
        }),
      );
      dispatch(setError(err.message || "Failed to update room name"));
    }
  }, [dispatch]);

  /**
   * Deletes a room and its associated storage
   */
  const deleteRoom = useCallback(async (roomId: string) => {
    try {
      const { error: deleteError } = await supabase.from("rooms").delete().eq("id", roomId);
      if (deleteError) throw deleteError;

      await fetch(`${import.meta.env.VITE_SERVER_URL || "http://localhost:3000"}/api/delete-room-storage/${roomId}`, {
        method: "DELETE",
      }).catch(err => console.error("Failed to delete storage:", err));

      dispatch(removeHostedRoom(roomId));
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to delete room"));
    }
  }, [dispatch]);

  /**
   * Leaves a room the user is a guest in
   */
  const leaveRoom = useCallback(async (roomId: string) => {
    try {
      const { error: leaveError } = await supabase
        .from("room_participants")
        .delete()
        .eq("room_id", roomId)
        .eq("user_id", userId);

      if (leaveError) throw leaveError;
      dispatch(removeJoinedRoom(roomId));
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to leave room"));
    }
  }, [userId, dispatch]);

  return {
    hostedRooms,
    joinedRooms,
    isLoading,
    error,
    retrieveRoomsData,
    createRoom,
    joinRoom,
    updateRoomTitle,
    deleteRoom,
    leaveRoom,
  };
};
