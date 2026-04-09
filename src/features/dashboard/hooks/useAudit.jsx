import { useState, useEffect } from "react";
import dashboardService from "../services/dashboardService";

/**
 * Hook to manage Admin Audit report data.
 */
const useAudit = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    manualPlanChanges: [],
    paymentCancellations: [],
    adminActivity: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getAuditLog();
        const result = response.data;
        if (result?.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error al cargar auditoría:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isSuspicious =
    data.manualPlanChanges.length > 0 ||
    data.paymentCancellations.length > 0 ||
    data.adminActivity.length > 0;

  return { auditLoading: loading, isSuspicious, auditData: data };
};

export default useAudit;
