import { useState, useEffect } from "react";
import { message } from "antd";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(initialKpiData);

  useEffect(() => {
    const fetchKpiData = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getKpis(filters);
        const result = response.data;
        
        if (!result?.success) {
          message.error(t("dashboard.loadKpisError"));
        }
        setData(result?.success ? result.data : initialKpiData);
      } catch (error) {
        console.error("Error KPI:", error);
        message.error(t("dashboard.loadKpisError"));
        setData(initialKpiData);
      } finally {
        setLoading(false);
      }
    };
    fetchKpiData();
  }, [filters, t]);

  return {
    kpiLoading: loading,
    kpiData: data,
  };
};

export default useKpis;
