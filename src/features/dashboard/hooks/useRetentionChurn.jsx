import { useState, useEffect, useMemo } from "react";
import dashboardService from "../services/dashboardService";

/**
 * Hook to manage Retention and Churn report data and ECharts options.
 */
const useRetentionChurn = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ cohortAnalysis: [], churnRate: [] });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getRetentionChurn();
        const result = response.data;
        if (result?.success) {
          setData(result.data);
        } else {
          setData({ cohortAnalysis: [], churnRate: [] });
        }
      } catch (error) {
        console.error("Error al cargar análisis de retención y churn:", error);
        setData({ cohortAnalysis: [], churnRate: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heatmapOption = useMemo(() => {
    const { cohortAnalysis } = data;
    if (!cohortAnalysis.length) return null;

    const months = [...new Set(cohortAnalysis.map((item) => item.cohort_month))]
      .sort()
      .reverse();
    const plans = [
      ...new Set(cohortAnalysis.map((item) => item.plan_name)),
    ].sort();

    const chartData = cohortAnalysis.map((item) => {
      const planIdx = plans.indexOf(item.plan_name);
      const monthIdx = months.indexOf(item.cohort_month);
      return [planIdx, monthIdx, parseFloat(item.retention_rate)];
    });

    return {
      backgroundColor: "transparent",
      tooltip: {
        position: "top",
        formatter: (params) => {
          const plan = plans[params.data[0]];
          const month = months[params.data[1]];
          const rate = params.data[2];
          return `<b>${plan}</b><br/>Mes: ${month}<br/>Retención: ${rate}%`;
        },
      },
      grid: {
        height: "65%",
        top: "10%",
        right: "5%",
        left: "15%",
        bottom: "20%",
      },
      xAxis: {
        type: "category",
        data: plans,
        splitArea: { show: true },
        axisLabel: {
          interval: 0,
          rotate: 15,
          fontSize: 10,
        },
      },
      yAxis: {
        type: "category",
        data: months,
        splitArea: { show: true },
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "0%",
        inRange: {
          color: [
            "rgba(10, 132, 255, 0.2)",
            "rgba(10, 132, 255, 0.6)",
            "#0A84FF",
          ],
        },
      },
      series: [
        {
          name: "Retención",
          type: "heatmap",
          data: chartData,
          label: {
            show: true,
            formatter: (params) => `${params.data[2]}%`,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  }, [data]);

  const churnGaugeOption = useMemo(() => {
    const { churnRate } = data;
    const latestChurn =
      churnRate.length > 0 ? parseFloat(churnRate[0].churn_rate) : 0;

    return {
      backgroundColor: "transparent",
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: "100%",
          center: ["50%", "75%"],
          progress: {
            show: true,
            width: 18,
          },
          pointer: {
            icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
            length: "12%",
            width: 20,
            offsetCenter: [0, "-60%"],
            itemStyle: {
              color: "auto",
            },
          },
          axisLine: {
            lineStyle: {
              width: 18,
              color: [
                [0.3, "rgba(10, 132, 255, 0.3)"],
                [0.7, "rgba(10, 132, 255, 0.6)"],
                [1, "#0A84FF"],
              ],
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            length: 15,
            lineStyle: {
              width: 2,
              color: "#999",
            },
          },
          axisLabel: {
            distance: 25,
            color: "#999",
            fontSize: 12,
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 25,
            itemStyle: {
              borderWidth: 10,
            },
          },
          title: {
            show: false,
          },
          detail: {
            valueAnimation: true,
            fontSize: 35,
            offsetCenter: [0, "-35%"],
            formatter: "{value}%",
            color: "inherit",
          },
          data: [
            {
              value: latestChurn,
              name: "Churn Rate",
            },
          ],
        },
      ],
    };
  }, [data]);

  return {
    retentionChurnLoading: loading,
    heatmapOption,
    churnGaugeOption,
  };
};

export default useRetentionChurn;
