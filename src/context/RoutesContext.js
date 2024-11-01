import React, { createContext, useState, useEffect } from "react";
import useFetch from "../hooks/useFetch";

export const RoutesContext = createContext();

export const RoutesProvider = ({ children }) => {
    const [routes, setRoutes] = useState([]);
    const { request } = useFetch();

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const data = await request("routes", "GET");
                setRoutes(data);
            } catch (error) {
                console.error("Error fetching routes:", error);
            }
        };
        fetchRoutes();
    }, [request]);

    return (
        <RoutesContext.Provider value={{ routes }}>
            {children}
        </RoutesContext.Provider>
    );
};
