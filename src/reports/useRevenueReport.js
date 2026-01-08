import { useState, useEffect, useMemo } from "react";
import { theme } from "antd";

export const useRevenueReport = (request) => {
    const { token } = theme.useToken();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ arpu: "0", paymentMethodAnalysis: [] });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await request("reports/revenue-optimization", "GET");
                if (response?.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Error al cargar optimización de ingresos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [request]);

    const donutOption = useMemo(() => {
        const { paymentMethodAnalysis, arpu } = data;
        const chartData = paymentMethodAnalysis.map((item) => ({
            value: parseFloat(item.total_revenue),
            name: item.payment_method,
        }));

        return {
            tooltip: { trigger: "item", formatter: "{b}: ${c} ({d}%)" },
            backgroundColor: "transparent",
            legend: { orient: "vertical", left: "left" },
            graphic: {
                type: "text",
                left: "center",
                top: "middle",
                style: {
                    text: `ARPU\n$${arpu}`,
                    textAlign: "center",
                    fill: token.colorText,
                    fontSize: 16,
                    fontWeight: "bold",
                },
            },
            series: [
                {
                    name: "Ingresos por Método",
                    type: "pie",
                    radius: ["40%", "70%"],
                    avoidLabelOverlap: false,
                    color: [
                        "#0A84FF",
                        "rgba(10, 132, 255, 0.7)",
                        "rgba(10, 132, 255, 0.5)",
                        "rgba(10, 132, 255, 0.3)",
                    ],
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: "#fff",
                        borderWidth: 2,
                    },
                    label: { show: false, position: "center" },
                    emphasis: {
                        label: { show: false },
                    },
                    labelLine: { show: false },
                    data: chartData,
                },
            ],
        };
    }, [data]);

    const barComparisonOption = useMemo(() => {
        const { paymentMethodAnalysis } = data;
        return {
            backgroundColor: "transparent",
            tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
            legend: { data: ["Transacciones", "Promedio ($)"] },
            xAxis: {
                type: "category",
                data: paymentMethodAnalysis.map((i) => i.payment_method),
            },
            yAxis: [
                {
                    type: "value",
                    name: "Cantidad",
                    splitLine: {
                        lineStyle: {
                            color: "rgba(0, 0, 0, 0.06)",
                            type: "dashed",
                        },
                    },
                },
                {
                    type: "value",
                    name: "USD",
                    axisLabel: { formatter: "${value}" },
                    splitLine: {
                        show: false,
                    },
                },
            ],
            series: [
                {
                    name: "Transacciones",
                    type: "bar",
                    data: paymentMethodAnalysis.map((i) => i.transaction_count),
                    itemStyle: { color: "#0A84FF" },
                },
                {
                    name: "Promedio ($)",
                    type: "bar",
                    yAxisIndex: 1,
                    data: paymentMethodAnalysis.map((i) => parseFloat(i.avg_transaction)),
                    itemStyle: { color: "rgba(10, 132, 255, 0.6)" },
                },
            ],
        };
    }, [data]);

    return { revenueLoading: loading, donutOption, barComparisonOption };
};
