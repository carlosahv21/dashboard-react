// Settings.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SettingsLayout from "./SettingsLayout";

// Redirige por defecto a general si la subruta no existe
const Settings = () => (
    <Routes>
        <Route path="/" element={<SettingsLayout />}>
            <Route index element={<Navigate to="general" replace />} />
            <Route path="*" element={<Navigate to="general" replace />} />
        </Route>
    </Routes>
);

export default Settings;
