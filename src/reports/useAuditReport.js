import { useState, useEffect } from "react";

export const useAuditReport = (request) => {
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
                const response = await request("reports/admin-audit", "GET");
                if (response?.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Error al cargar auditoría:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [request]);

    const isSuspicious =
        data.manualPlanChanges.length > 0 ||
        data.paymentCancellations.length > 0 ||
        data.adminActivity.length > 0;

    return { auditLoading: loading, isSuspicious, auditData: data };
};
