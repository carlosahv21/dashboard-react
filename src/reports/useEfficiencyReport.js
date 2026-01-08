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
            xAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%" } },
            yAxis: { type: "category", data: sortedData.map((i) => i.name) },
            series: [
                {
                    name: "Tasa de Llenado",
                    type: "bar",
                    data: sortedData.map((i) => {
                        const val = parseFloat(i.fill_rate);
                        let color = "#52c41a"; // Verde > 70
                        if (val < 20) color = "#f5222d"; // Rojo < 20
                        else if (val <= 70) color = "#faad14"; // Amarillo 20-70
                        return { value: val, itemStyle: { color } };
                    }),
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
