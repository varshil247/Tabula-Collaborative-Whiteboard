import React from "react";
import Whiteboard from "../components/whiteboard";
import RoomNavbar from "../components/roomNavbar"; // Adjust this import path based on what you named the file

const Room: React.FC = () => {
  return (
    // Added pt-[68px] (and max-md:pt-[56px]) to account for the fixed navbar
    <div className="flex h-screen max-h-screen flex-col overflow-hidden bg-primary">
      <RoomNavbar />

      {/* Replaced the hardcoded calc() heights with flex-1 for a cleaner, fully responsive layout */}
      <div className="flex flex-1 flex-row justify-between gap-4 overflow-hidden p-3 max-md:flex-col">
        <Whiteboard />
      </div>
    </div>
  );
};

export default Room;
