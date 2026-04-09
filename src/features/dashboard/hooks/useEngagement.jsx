import { useState, useEffect, useMemo } from "react";
import dashboardService from "../services/dashboardService";

/**
 * Hook to manage Student Engagement report data and ECharts options.
 */
const useEngagement = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ classUtilization: [], usersAtRisk: [] });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getEngagement();
        const result = response.data;
        if (result?.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error al cargar engagement de estudiantes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scatterOption = useMemo(() => {
    const { classUtilization } = data;
    const chartData = classUtilization.map((item) => [
      item.max_classes,
      item.classes_used,
      `${item.first_name} ${item.last_name}`,
      item.plan_name,
    ]);

    return {
      tooltip: {
        formatter: (params) => {
          return `<b>${params.data[2]}</b><br/>Plan: ${params.data[3]}<br/>Max. Clases: ${params.data[0]}<br/>Uso: ${params.data[1]}`;
        },
      },
      backgroundColor: "transparent",
      xAxis: {
        name: "Capacidad Plan",
        type: "value",
        splitLine: {
          lineStyle: {
            color: "rgba(0, 0, 0, 0.06)",
            type: "dashed",
          },
        },
      },
      yAxis: {
        name: "Clases Usadas",
        type: "value",
        splitLine: {
          lineStyle: {
            color: "rgba(0, 0, 0, 0.06)",
            type: "dashed",
          },
        },
      },
      series: [
        {
          symbolSize: 20,
          data: chartData,
          type: "scatter",
          itemStyle: {
            color: "#0A84FF",
            opacity: 0.6,
          },
        },
      ],
    };
  }, [data]);

  return {
    engagementLoading: loading,
    scatterOption,
    usersAtRisk: data.usersAtRisk,
  };
};

export default useEngagement;
