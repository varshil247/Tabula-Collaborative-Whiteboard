import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Join from "./pages/join";
import Login from "./pages/login";
import Register from "./pages/register";
import Room from "./pages/room";
import Dashboard from "./pages/dashboard";

const App = () => {
  const { user } = useSelector((state: any) => state.user);
  let routes: React.ReactNode = null;

  if (!user) {
    routes = (
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  } else if (user.type === "auth") {
    routes = (
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room" element={<Room />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    );
  } else if (user.type === "guest") {
    routes = (
      <Routes>
        <Route path="/room" element={<Room />} />
        <Route path="*" element={<Navigate to="/room" />} />
      </Routes>
    );
  }

  return <>{routes}</>;
};

export default App;