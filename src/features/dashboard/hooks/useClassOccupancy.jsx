import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import dashboardService from "../services/dashboardService";

/**
 * Hook to manage Class Occupancy report data, including genre filtering and drilldown.
 */
const useClassOccupancy = (filters) => {
  const navigate = useNavigate();
  const chartInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [classOccupancyData, setClassOccupancyData] = useState([]);

  // Available and selected genres
  const [availableGenres, setAvailableGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Current chart option (can be main or drilldown)
  const [currentOption, setCurrentOption] = useState(null);

  // Drilldown state
  const [currentClassId, setCurrentClassId] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getClassOccupancy(filters);
        const result = response.data;
        if (result?.success) {
          const parsedData = result.data.map((item) => ({
            ...item,
            occupancy_rate: parseFloat(item.occupancy_rate),
          }));
          setClassOccupancyData(parsedData);

          const uniqueGenres = [
            ...new Set(parsedData.map((item) => item.genre)),
          ].sort();

          setAvailableGenres(uniqueGenres);

          if (uniqueGenres.length > 0 && (!selectedGenre || !uniqueGenres.includes(selectedGenre))) {
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
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset drilldown when genre changes
  useEffect(() => {
    setCurrentClassId(null);
  }, [selectedGenre]);

  // Generate main chart option
  const { mainOption, classesMap } = useMemo(() => {
    if (!selectedGenre || classOccupancyData.length === 0) {
      return { mainOption: null, classesMap: {} };
    }

    const classesMap = {};
    const filteredClasses = classOccupancyData.filter(
      (item) => item.genre === selectedGenre
    );

    const chartData = filteredClasses
      .map((item, index) => {
        const classId = `${selectedGenre}-${index}`;
        classesMap[classId] = {
          id: item.id,
          name: item.name,
          capacity: item.capacity,
          enrolled: item.enrolled_count,
          occupancy_rate: item.occupancy_rate,
        };

        return {
          value: item.occupancy_rate,
          name: item.name,
          classId: classId,
          itemStyle: { color: "#0A84FF" },
        };
      })
      .sort((a, b) => b.value - a.value);

    const option = {
      backgroundColor: "transparent",
      textStyle: { fontFamily: "'Inter', sans-serif" },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const data = params[0];
          return `<b>${data.name}</b><br/>Ocupación: <b>${data.value}%</b><br/><i>Click para ver detalles</i>`;
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: chartData.map((item) => item.name),
        axisLabel: { rotate: 45, interval: 0, fontSize: 11 },
      },
      yAxis: {
        type: "value",
        name: "Tasa de Ocupación (%)",
        axisLabel: { formatter: "{value}%" },
        splitLine: {
          lineStyle: {
            color: "rgba(0, 0, 0, 0.06)",
            type: "dashed",
          },
        },
      },
      series: [
        {
          type: "bar",
          data: chartData,
          barMaxWidth: 50,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: (params) => params.data.itemStyle.color,
          },
          label: {
            position: "top",
            formatter: "{c}%",
            fontSize: 11,
          },
          cursor: "pointer",
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
      graphic: [],
    };

    return { mainOption: option, classesMap };
  }, [classOccupancyData, selectedGenre]);

  // Generate drilldown chart option
  const generateDrilldownOption = useCallback((classItem) => {
    const data = [
      { name: "Capacidad", value: classItem.capacity, color: "#0A84FF" },
      {
        name: "Inscritos",
        value: classItem.enrolled,
        color: "rgba(10, 132, 255, 0.6)",
      },
    ];

    return {
      textStyle: { fontFamily: "'Inter', sans-serif" },
      title: {
        text: classItem.name,
        subtext: `Tasa de Ocupación: ${classItem.occupancy_rate.toFixed(2)}%`,
        left: "center",
        top: "2%",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const data = params[0];
          return `<b>${data.name}</b><br/>Cantidad: <b>${data.value}</b>`;
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        top: "20%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.name),
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        name: "Cantidad de Personas",
        splitLine: {
          lineStyle: {
            color: "rgba(0, 0, 0, 0.06)",
            type: "dashed",
          },
        },
      },
      series: [
        {
          type: "bar",
          data: data.map((d) => ({
            value: d.value,
            name: d.name,
            classId: classItem.id, // Use the real ID here for drilldown clicks
            itemStyle: { color: d.color },
          })),
          barMaxWidth: 80,
          itemStyle: { borderRadius: [6, 6, 0, 0] },
          cursor: "pointer",
          label: { position: "top", fontSize: 14, fontWeight: "bold" },
        },
      ],
      graphic: [
        {
          type: "group",
          left: 20,
          top: 5,
          children: [
            {
              type: "rect",
              z: 100,
              left: 0,
              top: 0,
              shape: { width: 80, height: 32, r: 6 },
              style: { fill: "#1890ff", stroke: "#096dd9", lineWidth: 1 },
              onclick: () => setCurrentClassId(null),
              cursor: "pointer",
            },
            {
              type: "text",
              z: 100,
              left: 16,
              top: 9,
              style: {
                text: "← Atrás",
                fontSize: 13,
                fill: "#fff",
                fontWeight: "bold",
              },
              onclick: () => setCurrentClassId(null),
              cursor: "pointer",
            },
          ],
        },
      ],
    };
  }, []);

  // Update currentOption
  useEffect(() => {
    if (!currentClassId && mainOption) {
      setCurrentOption(mainOption);
    } else if (currentClassId && classesMap[currentClassId]) {
      const classItem = classesMap[currentClassId];
      setCurrentOption(generateDrilldownOption(classItem));
    }
  }, [currentClassId, mainOption, classesMap, generateDrilldownOption]);

  const onOccupancyChartClick = useCallback(
    (event) => {
      if (!event.data) return;

      if (!currentClassId) {
        // Step 1 -> Step 2: From Classes to Details
        if (event.data.classId) {
          setCurrentClassId(event.data.classId);
        }
      } else {
        // Step 2 -> Redirection
        const classItem = classesMap[currentClassId];
        if (classItem && classItem.id) {
          navigate(`/classes/${classItem.id}/details`);
        }
      }
    },
    [currentClassId, classesMap, navigate]
  );

  // Update event listener when handler changes to avoid stale closure
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.off("click");
      chartInstanceRef.current.on("click", onOccupancyChartClick);
    }
  }, [onOccupancyChartClick]);

  const onOccupancyChartReady = useCallback((echartsInstance) => {
    chartInstanceRef.current = echartsInstance;
    // Attach immediately to avoid missing first click
    echartsInstance.off("click");
    echartsInstance.on("click", onOccupancyChartClick);
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

export default useClassOccupancy;
