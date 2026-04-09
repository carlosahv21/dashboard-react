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
const useKpis = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(initialKpiData);

  useEffect(() => {
    const fetchKpiData = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getKpis();
        // Since axios might return response.data directly depending on interceptors, 
        // we check both response.data.success or direct response.success if it's already unwrapped.
        // Looking at axiosInstance, it returns the raw response object.
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
  }, []);

  return {
    kpiLoading: loading,
    kpiData: data,
  };
};

export default useKpis;
