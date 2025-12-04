import { useState, useEffect, useMemo, useCallback } from "react";
import { message } from "antd";
import useFetch from "./useFetch";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "dayjs/locale/en";

dayjs.locale("es");

// Función auxiliar para obtener el día actual en inglés (para el filtro de API/DB)
const getCurrentDayEnglish = () => dayjs().locale("en").format("dddd").toLowerCase();

// Función auxiliar para obtener la fecha actual en formato YYYY-MM-DD (para la asistencia diaria)
const getCurrentDate = () => dayjs().format("YYYY-MM-DD");

const useAttendanceData = () => {
    const { request } = useFetch();

    // --- Estado de Clases ---
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [loadingClasses, setLoadingClasses] = useState(false);

    // --- Estado de Paginación ---
    const [pagination, setPagination] = useState({
        current: 1,
        total: 0,
        pageSize: 10,
    });

    // --- Estado de Estudiantes ---
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [attendanceData, setAttendanceData] = useState({});
    const [searchText, setSearchText] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const currentDaySpanish = dayjs().locale("es").format("dddd");

    // Función para manejar el cambio de página/tamaño
    const handleTableChange = useCallback((page, pageSize) => {
        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize: pageSize,
        }));
    }, []);

    // 1. Fetch de Clases (Depende de la paginación)
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoadingClasses(true);
                const { current, pageSize } = pagination;
                const today = getCurrentDayEnglish();

                // Agregar parámetros de paginación a la URL
                const url = `classes?date=${today}&page=${current}&limit=${pageSize}`;
                const response = await request(url, "GET");

                const allClasses = response.data || [];
                const total = response.total || 0;

                setClasses(allClasses);

                setPagination(prev => ({
                    ...prev,
                    total,
                    current: allClasses.length === 0 && current > 1 ? current - 1 : current
                }));

                // Seleccionar la primera clase si la lista no está vacía y no hay una clase ya seleccionada
                if (allClasses.length > 0 && !selectedClass) {
                    setSelectedClass(allClasses[0]);
                }
            } catch (error) {
                console.error(error);
                message.error("Error al cargar las clases");
            } finally {
                setLoadingClasses(false);
            }
        };
        fetchClasses();
    }, [request, pagination.current, pagination.pageSize]);

    // 2. Fetch de Estudiantes y Asistencias cuando cambia la clase seleccionada
    useEffect(() => {
        if (!selectedClass) {
            setStudents([]);
            setAttendanceData({});
            return;
        }

        const fetchStudentsAndAttendance = async () => {
            try {
                setLoadingStudents(true);

                // --- 2.1. Fetch de Estudiantes (Registrations) ---
                const studentsResponse = await request(`registrations?class_id=${selectedClass.id}`, "GET");
                const studentsList = studentsResponse.data?.map(reg => ({
                    user_id: reg.user_id,
                    name: `${reg.user_first_name} ${reg.user_last_name}` || "Estudiante",
                    avatar: reg.user_avatar,
                    ...reg
                })) || [];

                setStudents(studentsList);

                // 1. Inicializar asistencia: todos ausentes (false)
                const initialAttendance = {};
                studentsList.forEach(s => {
                    // Usamos user_id como key (lo convertimos a string, ya que las keys de JS son strings)
                    initialAttendance[String(s.user_id)] = false;
                });

                // --- 2.2. Fetch de Asistencias Existentes para la fecha actual ---
                const todayDate = getCurrentDate();
                const attendanceUrl = `attendance/details?class_id=${selectedClass.id}&date=${todayDate}`;

                // Nota: Asumiendo que el endpoint soporta el filtro `&date=YYYY-MM-DD` para obtener solo el registro de hoy.
                const attendanceResponse = await request(attendanceUrl, "GET");

                const existingAttendance = attendanceResponse || [];

                // 3. Sobrescribir el estado de asistencia con los datos existentes
                const finalAttendance = { ...initialAttendance };

                existingAttendance.forEach(record => {
                    // El status 'present' marca el checkbox como true
                    const isPresent = record.status?.toLowerCase() === "present";
                    // Asegurarse de que el student_id de la API se maneje como string
                    finalAttendance[String(record.student_id)] = isPresent;
                });

                // 4. Actualizar el estado de asistencia con los datos cargados
                setAttendanceData(finalAttendance);

            } catch (error) {
                console.error("Error al cargar estudiantes y/o asistencias:", error);
                message.error("Error al cargar estudiantes o asistencias");
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchStudentsAndAttendance();
    }, [selectedClass, request]);


    // 3. Lógica de Filtrado de Estudiantes (useMemo para optimización)
    const filteredStudents = useMemo(() => {
        if (!searchText) {
            return students;
        }
        const lower = searchText.toLowerCase();
        return students.filter(s => s.name.toLowerCase().includes(lower));
    }, [searchText, students]);

    // 4. Handlers de Asistencia (Optimizadas con useCallback)
    const handleToggleAttendance = useCallback((studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    }, []);

    const handleSelectAll = useCallback((checked) => {
        const newData = { ...attendanceData };
        // Solo afecta a los estudiantes que están actualmente filtrados/visibles
        filteredStudents.forEach(s => {
            newData[s.user_id] = checked;
        });
        setAttendanceData(newData);
    }, [attendanceData, filteredStudents]);

    // Comprueba si todos los estudiantes filtrados están marcados para el checkbox "Marcar Todos"
    const areAllFilteredPresent = filteredStudents.length > 0 &&
        filteredStudents.every(s => attendanceData[s.user_id]);

    // Comprueba si ALGUNOS (pero no todos) los estudiantes filtrados están marcados
    const isIndeterminate = filteredStudents.some(s => attendanceData[s.user_id]) &&
        !areAllFilteredPresent;


    // 5. Función de Guardado (Optimizada con useCallback)
    const saveAttendance = useCallback(async () => {
        if (!selectedClass || students.length === 0) return;

        const attendanceArray = Object.keys(attendanceData).map(studentId => ({
            class_id: selectedClass.id,
            // Convertir la clave (string) a entero para enviarla a la API, si es necesario.
            student_id: parseInt(studentId, 10),
            date: dayjs().format("YYYY-MM-DD"),
            status: attendanceData[studentId] ? "Present" : "Absent"
        }));

        if (attendanceArray.length === 0) {
            message.warning("No hay registros de asistencia para enviar.");
            return;
        }

        try {
            setIsSaving(true);
            await request("attendance", "POST", attendanceArray);
            message.success("Asistencia guardada correctamente");
        } catch (error) {
            console.error("Error al guardar asistencia:", error);
            message.error("Error al guardar asistencia");
        } finally {
            setIsSaving(false);
        }
    }, [selectedClass, students.length, attendanceData, request]);

    return {
        // Clases
        classes,
        selectedClass,
        setSelectedClass,
        loadingClasses,
        currentDaySpanish,

        // Estudiantes
        filteredStudents,
        loadingStudents,
        attendanceData,
        searchText,
        setSearchText,

        // Asistencia & Guardado
        handleToggleAttendance,
        handleSelectAll,
        saveAttendance,
        isSaving,

        pagination,
        setPagination: handleTableChange,

        // Propiedades para Checkbox "Marcar Todos"
        areAllFilteredPresent,
        isIndeterminate,

        // Metadata
        hasStudents: students.length > 0,
    };
};

export default useAttendanceData;