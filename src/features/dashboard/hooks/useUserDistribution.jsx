import { useState, useEffect, useMemo } from "react";
import dashboardService from "../services/dashboardService";

/**
 * Hook to manage User Distribution report data and ECharts options.
 */
const useUserDistribution = (filters) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getUserDistribution(filters);
        const result = response.data;
        if (result?.success) {
          setData(result.data);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error al cargar distribución de usuarios:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const chartOption = useMemo(() => {
    const mappedData = data.map((item) => ({
      value: item.user_count,
      name: item.plan_name,
      plan_id: item.plan_id, // Incluir ID para navegación
    }));

    return {
      tooltip: { trigger: "item", formatter: "{b}: {c} Alumnos ({d}%)" },
      backgroundColor: "transparent",
      textStyle: { fontFamily: "'Inter', sans-serif" },
      legend: {
        orient: "horizontal",
        left: "center",
        bottom: 0,
        data: mappedData.map((item) => item.name),
      },
      series: [
        {
          name: "Alumnos",
          type: "pie",
          radius: ["30%", "55%"],
          center: ["50%", "45%"],
          data: mappedData,
          color: [
            "#0A84FF",
            "rgba(10, 132, 255, 0.7)",
            "rgba(10, 132, 255, 0.5)",
            "rgba(10, 132, 255, 0.3)",
          ],
          label: {
            show: true,
            formatter: "{b}: {d}%",
            position: "outside",
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  }, [data]);

  return {
    userDistributionLoading: loading,
    userDistributionOption: chartOption,
  };
};

export default useUserDistribution;
