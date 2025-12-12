// Reports/useKpisData.js

import { useState, useEffect } from 'react';
import { message } from 'antd'; // Asegúrate de tener esta importación

const initialKpiData = {
    activeStudents: 0,
    todayClasses: 0,
    monthlyRevenue: 0,
    attendanceRate: 0.0,
};

const useKpisData = (request) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(initialKpiData);

    useEffect(() => {
        const fetchKpiData = async () => {
            setLoading(true);
            try {
                const response = await request("reports/kpi", "GET");
                if (!response?.success) {
                    message.error("Error al cargar los KPIs");
                }
                setData(response?.success ? response.data : initialKpiData);
            } catch (error) {
                console.error("Error KPI:", error);
                message.error("Error al cargar los KPIs");
                setData(initialKpiData);
            } finally {
                setLoading(false);
            }
        };
        fetchKpiData();
    }, [request]);

    // **CORRECCIÓN:** Retornar el estado y la data
    return { 
        kpiLoading: loading, 
        kpiData: data 
    };
};

export default useKpisData; // Usamos export default para este hook