import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
import { RoutesProvider } from "./context/RoutesContext";

import Login from "./views/Auth/Login";
import Layout from "./views/Layout/Layout";
import Dashboard from "./views/Dashboard/Dashboard";
import Settings from "./views/Settings/Settings";
import Classes from "./views/Classes/Classes";
import CreateOrEditClass from "./views/Classes/CreateOrEditClass"; // Corrección de importación

import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  return (
    <SettingsProvider>
      <RoutesProvider>
        <BrowserRouter>
          {isAuthenticated ? (
            <Routes>
              {/* Define Dashboard como el layout base */}
              <Route element={<Layout setIsAuthenticated={setIsAuthenticated} />}>
                <Route path="/" element={<Dashboard />} /> {/* Vista principal de Dashboard */}
                <Route path="settings" element={<Settings />} />
                <Route path="classes" element={<Classes />} />
                <Route path="classes/create" element={<CreateOrEditClass />} /> {/* Crear clase */}
                <Route path="classes/edit/:id" element={<CreateOrEditClass />} /> {/* Editar clase */}
                <Route path="*" element={<Navigate to="/" />} />
              </Route>
            </Routes>
          ) : (
            <Login setIsAuthenticated={setIsAuthenticated} />
          )}
        </BrowserRouter>
      </RoutesProvider>
    </SettingsProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
