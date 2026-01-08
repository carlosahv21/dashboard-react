import { useState, useEffect, useMemo } from "react";

export const useEfficiencyReport = (request) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        fillRateByClass: [],
        teacherEfficiency: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await request("reports/operational-efficiency", "GET");
                if (response?.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Error al cargar eficiencia operativa:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [request]);

    const fillRateOption = useMemo(() => {
        const sortedData = [...data.fillRateByClass].sort(
            (a, b) => parseFloat(a.fill_rate) - parseFloat(b.fill_rate)
        );

        return {
            tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
            backgroundColor: "transparent",
            grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
            xAxis: {
                type: "value",
                max: 100,
                axisLabel: { formatter: "{value}%" },
                splitLine: {
                    lineStyle: {
                        color: "rgba(0, 0, 0, 0.06)",
                        type: "dashed",
                    },
                },
            },
            yAxis: { type: "category", data: sortedData.map((i) => i.name) },
            series: [
                {
                    name: "Tasa de Llenado",
                    type: "bar",
                    data: sortedData.map((i) => ({
                        value: parseFloat(i.fill_rate),
                        itemStyle: { color: "#0A84FF" },
                    })),
                },
            ],
        };
    }, [data]);

    const teacherRadarOption = useMemo(() => {
        const { teacherEfficiency } = data;
        if (!teacherEfficiency.length) return null;

        const indicators = [
            {
                name: "Clases Dictadas",
                max: Math.max(...teacherEfficiency.map((i) => i.classes_taught)) + 2,
            },
            {
                name: "Asistencia Total",
                max:
                    Math.max(
                        ...teacherEfficiency.map((i) => parseInt(i.total_attendance))
                    ) + 20,
            },
            { name: "Tasa Llenado Avg", max: 100 },
        ];

        return {
            tooltip: {},
            backgroundColor: "transparent",
            legend: {
                data: teacherEfficiency.map((i) => `${i.first_name} ${i.last_name}`),
            },
            radar: {
                indicator: indicators,
            },
            series: [
                {
                    name: "Eficiencia Docente",
                    type: "radar",
                    itemStyle: {
                        color: "#0A84FF",
                    },
                    lineStyle: {
                        color: "#0A84FF",
                    },
                    areaStyle: {
                        color: "rgba(10, 132, 255, 0.2)",
                    },
                    data: teacherEfficiency.map((i) => ({
                        value: [
                            i.classes_taught,
                            parseInt(i.total_attendance),
                            parseFloat(i.avg_fill_rate),
                        ],
                        name: `${i.first_name} ${i.last_name}`,
                    })),
                },
            ],
        };
    }, [data]);

    return { efficiencyLoading: loading, fillRateOption, teacherRadarOption };
};
