import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../views/Layout";
import Login from "../views/Login";

// Asegúrate de que el usuario esté autenticado antes de mostrar el dashboard
const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default AppRoutes;
