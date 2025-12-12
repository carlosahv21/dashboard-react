// Reports/useUserDistributionReport.js
import { useState, useEffect, useMemo } from 'react';

export const useUserDistributionReport = (request) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await request("reports/user-distribution", "GET");
                if (response?.success) {
                    setData(response.data);
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
    }, [request]);

    // Mapeo y Opciones del Gráfico (useMemo para rendimiento)
    const chartOption = useMemo(() => {
        const mappedData = data.map(item => ({
            value: item.user_count,
            name: item.plan_name
        }));

        return {
            tooltip: { trigger: 'item', formatter: '{b}: {c} Alumnos ({d}%)' },
            backgroundColor: 'transparent',
            legend: {
                orient: 'horizontal',
                left: 'center',
                bottom: 0,
                data: mappedData.map(item => item.name)
            },
            series: [{
                name: 'Alumnos',
                type: 'pie',
                radius: ['30%', '55%'],
                center: ['50%', '45%'],
                data: mappedData,
                label: {
                    show: true,
                    formatter: '{b}: {d}%',
                    position: 'outside'
                },
                emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
            }]
        };
    }, [data]);

    return {
        userDistributionLoading: loading,
        userDistributionOption: chartOption,
    };
};