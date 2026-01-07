import { useState, useEffect, useMemo, useCallback } from 'react';

export const useClassOccupancyReport = (request) => {
    const [loading, setLoading] = useState(true);
    const [classOccupancyData, setClassOccupancyData] = useState([]);

    // Estado para géneros disponibles y género seleccionado
    const [availableGenres, setAvailableGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);

    // Estado para la opción actual del gráfico
    const [currentOption, setCurrentOption] = useState(null);

    // Estado para saber si estamos en drilldown (viendo detalles de una clase)
    const [currentClassId, setCurrentClassId] = useState(null);

    // Fetch data from API - SOLO UNA VEZ al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await request("reports/class-occupancy", "GET");
                if (response?.success) {
                    const parsedData = response.data.map(item => ({
                        ...item,
                        occupancy_rate: parseFloat(item.occupancy_rate)
                    }));
                    setClassOccupancyData(parsedData);

                    // Extraer géneros únicos
                    const uniqueGenres = [...new Set(parsedData.map(item => item.genre))].sort();
                    setAvailableGenres(uniqueGenres);

                    // Seleccionar el primer género por defecto solo si no hay uno seleccionado
                    if (uniqueGenres.length > 0 && !selectedGenre) {
                        setSelectedGenre(uniqueGenres[0]);
                    }
                } else {
                    setClassOccupancyData([]);
                    setAvailableGenres([]);
                    setSelectedGenre(null);
                }
            } catch (error) {
                console.error("Error al cargar ocupación de clases:", error);
                setClassOccupancyData([]);
                setAvailableGenres([]);
                setSelectedGenre(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

    }, [request]); // Solo ejecutar cuando request cambia (una vez al montar)

    // Resetear drilldown cuando cambia el género (sin recargar datos)
    useEffect(() => {
        setCurrentClassId(null);
    }, [selectedGenre]);

    // Generar opción de gráfico principal (clases por género)
    const { mainOption, classesMap } = useMemo(() => {
        if (!selectedGenre || classOccupancyData.length === 0) {
            return { mainOption: null, classesMap: {} };
        }

        const classesMap = {};

        // Filtrar clases del género seleccionado
        const filteredClasses = classOccupancyData.filter(item => item.genre === selectedGenre);

        // Preparar datos para el gráfico
        const chartData = filteredClasses.map((item, index) => {
            const classId = `${selectedGenre}-${index}`;

            // Almacenar datos de la clase para el drilldown
            classesMap[classId] = {
                name: item.name,
                capacity: item.capacity,
                enrolled: item.enrolled_count,
                occupancy_rate: item.occupancy_rate
            };

            return {
                value: item.occupancy_rate,
                name: item.name,
                classId: classId,
                itemStyle: {
                    // color amarillo si es mayor 95% para avisarle al usuario que esta cerca de agotarse el limite, verde si es menor a 95 y mayor a 30%, rojo si es menor a 30%. La idea es saber si la clase tiene un problema de ocupación
                    color: item.occupancy_rate > 95 ? '#faad14' : item.occupancy_rate > 30 ? '#52c41a' : '#ff4d4f'
                }
            };
        }).sort((a, b) => b.value - a.value); // Ordenar por ocupación descendente

        // Configuración del gráfico principal
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params) => {
                    const data = params[0];
                    return `<b>${data.name}</b><br/>Ocupación: <b>${data.value}%</b><br/><i>Click para ver detalles</i>`;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: chartData.map(item => item.name),
                axisLabel: {
                    rotate: 45,
                    interval: 0,
                    fontSize: 11
                }
            },
            yAxis: {
                type: 'value',
                name: 'Tasa de Ocupación (%)',
                axisLabel: { formatter: '{value}%' }
            },
            series: [{
                type: 'bar',
                data: chartData,
                barMaxWidth: 50,
                itemStyle: {
                    borderRadius: [6, 6, 0, 0],
                    color: (params) => params.data.itemStyle.color
                },
                label: {
                    position: 'top',
                    formatter: '{c}',
                    fontSize: 11
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }],
            graphic: []
        };

        return { mainOption: option, classesMap };
    }, [classOccupancyData, selectedGenre]);

    // Generar opción de drilldown (detalles de una clase)
    const generateDrilldownOption = useCallback((classItem) => {
        const data = [
            { name: 'Capacidad', value: classItem.capacity, color: '#1890ff' },
            { name: 'Inscritos', value: classItem.enrolled, color: '#faad14' }
        ];

        return {
            title: {
                text: classItem.name,
                subtext: `Tasa de Ocupación: ${classItem.occupancy_rate.toFixed(2)}%`,
                left: 'center',
                top: '2%'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params) => {
                    const data = params[0];
                    return `<b>${data.name}</b><br/>Cantidad: <b>${data.value}</b>`;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '20%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(d => d.name)
            },
            yAxis: {
                type: 'value',
                name: 'Cantidad de Personas'
            },
            series: [{
                type: 'bar',
                data: data.map(d => ({
                    value: d.value,
                    itemStyle: { color: d.color }
                })),
                barMaxWidth: 80,
                itemStyle: {
                    borderRadius: [6, 6, 0, 0]
                },
                label: {
                    position: 'top',
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            }],
            graphic: [{
                type: 'group',
                left: 20,
                top: 5,
                children: [{
                    type: 'rect',
                    z: 100,
                    left: 0,
                    top: 0,
                    shape: {
                        width: 80,
                        height: 32,
                        r: 6
                    },
                    style: {
                        fill: '#1890ff',
                        stroke: '#096dd9',
                        lineWidth: 1
                    },
                    onclick: () => setCurrentClassId(null),
                    cursor: 'pointer'
                }, {
                    type: 'text',
                    z: 100,
                    left: 16,
                    top: 9,
                    style: {
                        text: '← Atrás',
                        fontSize: 13,
                        fill: '#fff',
                        fontWeight: 'bold'
                    },
                    onclick: () => setCurrentClassId(null),
                    cursor: 'pointer'
                }]
            }]
        };
    }, []);

    // Actualizar currentOption basado en el estado
    useEffect(() => {
        if (!currentClassId && mainOption) {
            // Mostrar gráfico principal
            setCurrentOption(mainOption);
        } else if (currentClassId && classesMap[currentClassId]) {
            // Mostrar drilldown
            const classItem = classesMap[currentClassId];
            const drilldownOption = generateDrilldownOption(classItem);
            setCurrentOption(drilldownOption);
        }
    }, [currentClassId, mainOption, classesMap, generateDrilldownOption]);

    // Manejar click en el gráfico
    const onOccupancyChartClick = useCallback((event) => {
        if (event.data && event.data.classId && !currentClassId) {
            setCurrentClassId(event.data.classId);
        }
    }, [currentClassId]);

    // Configurar eventos del gráfico
    const onOccupancyChartReady = useCallback((echartsInstance) => {
        echartsInstance.off('click');
        echartsInstance.on('click', onOccupancyChartClick);
    }, [onOccupancyChartClick]);

    return {
        classOccupancyLoading: loading,
        availableGenres,
        selectedGenre,
        setSelectedGenre,
        occupancyDrilldownOption: currentOption,
        onOccupancyChartReady,
    };
};