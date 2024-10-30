import React, { createContext, useState, useEffect } from "react";

// Crear el contexto
export const SettingsContext = createContext();

// Proveedor de settings
export const SettingsProvider = ({ children }) => {
  // Intentar obtener los settings desde el localStorage al cargar
  const [settings, setSettings] = useState(() => {
    const storedSettings = localStorage.getItem("settings");
    return storedSettings ? JSON.parse(storedSettings) : null;
  });

  // Guardar los settings en el localStorage cada vez que cambien
  useEffect(() => {
    if (settings) {
      localStorage.setItem("settings", JSON.stringify(settings));
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
