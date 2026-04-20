import { useState, useEffect } from "react";
import { message } from "antd";
import dashboardService from "../services/dashboardService";

const initialKpiData = {
  activeStudents: 0,
  todayClasses: 0,
  monthlyRevenue: 0,
  attendanceRate: 0.0,
};

/**
 * Hook to manage KPI data.
 */
const useKpis = (filters) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(initialKpiData);

  useEffect(() => {
    const fetchKpiData = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getKpis(filters);
        const result = response.data;
        
        if (!result?.success) {
          message.error("Error al cargar los KPIs");
        }
        setData(result?.success ? result.data : initialKpiData);
      } catch (error) {
        console.error("Error KPI:", error);
        message.error("Error al cargar los KPIs");
        setData(initialKpiData);
      } finally {
        setLoading(false);
      }
    };
    fetchKpiData();
  }, [filters]);

  return {
    kpiLoading: loading,
    kpiData: data,
  };
};

export default useKpis;
