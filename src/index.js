import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";

import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import Settings from "./views/Settings"; // Importa la vista de Settings

import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  return (
    <SettingsProvider> {/* Envuelve la app con el proveedor */}
      <BrowserRouter>
        {isAuthenticated ? (
          <Routes>
            {/* Ruta para Dashboard que actúa como contenedor base */}
            <Route path="/dashboard" element={<Dashboard setIsAuthenticated={setIsAuthenticated} />}>
              {/* Rutas hijas dentro del dashboard que cambian el content */}
              <Route path="settings" element={<Settings />} />
              {/* Redireccionamiento predeterminado a Settings */}
              <Route path="*" element={<Navigate to="/dashboard/settings" />} />
            </Route>
            {/* Otras rutas que pueden estar fuera del dashboard */}
          </Routes>
        ) : (
          <Login setIsAuthenticated={setIsAuthenticated} />
        )}
      </BrowserRouter>
    </SettingsProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
