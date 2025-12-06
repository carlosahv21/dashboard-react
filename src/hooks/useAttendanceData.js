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

    // --- Estado de Paginación Clases ---
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

    // --- Estado de Paginación Estudiantes ---
    const [studentPagination, setStudentPagination] = useState({
        current: 1,
        total: 0,
        pageSize: 10,
    });

    const currentDaySpanish = dayjs().locale("es").format("dddd");

    // Función para manejar el cambio de página/tamaño (Clases)
    const handleTableChange = useCallback((page, pageSize) => {
        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize: pageSize,
        }));
    }, []);

    // Función para manejar el cambio de página/tamaño (Estudiantes)
    const handleStudentPageChange = useCallback((page, pageSize) => {
        setStudentPagination(prev => ({
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

    // 2. Fetch de Estudiantes y Asistencias cuando cambia la clase seleccionada o la paginación de estudiantes
    useEffect(() => {
        if (!selectedClass) {
            setStudents([]);
            setAttendanceData({});
            setStudentPagination(prev => ({ ...prev, total: 0, current: 1 }));
            return;
        }

        const fetchStudentsAndAttendance = async () => {
            try {
                setLoadingStudents(true);
                const { current, pageSize } = studentPagination;

                // --- 2.1. Fetch de Estudiantes (Registrations) ---
                const studentsResponse = await request(`registrations?class_id=${selectedClass.id}&page=${current}&limit=${pageSize}`, "GET");

                const studentsList = studentsResponse.data?.map(reg => ({
                    user_id: reg.user_id,
                    name: `${reg.user_first_name} ${reg.user_last_name}` || "Estudiante",
                    avatar: reg.user_avatar,
                    ...reg
                })) || [];

                setStudents(studentsList);
                setStudentPagination(prev => ({
                    ...prev,
                    total: studentsResponse.total || 0
                }));

                // 3. Fusionar datos existentes
                const pageAttendance = {};

                // Primero poblar con valores por defecto (false) para todos en la lista
                studentsList.forEach(s => {
                    pageAttendance[String(s.user_id)] = false;
                });

                // --- 2.2. Fetch de Asistencia Existente ---
                // Necesitamos saber si ya se tomó lista hoy para esta clase
                const todayDate = getCurrentDate();
                const attendanceResponse = await request(`attendance?class_id=${selectedClass.id}&date=${todayDate}`, "GET");
                const existingAttendance = attendanceResponse.data || [];

                // Luego actualizar con la DB
                existingAttendance.forEach(record => {
                    const isPresent = record.status?.toLowerCase() === "present";
                    const studentIdStr = String(record.student_id);
                    if (pageAttendance.hasOwnProperty(studentIdStr)) {
                        pageAttendance[studentIdStr] = isPresent;
                    }
                });

                // 4. Actualizar el estado de asistencia fusionando con lo anterior
                // PRIORIDAD: Si ya existe un valor en el estado local (prev), lo mantenemos (cambios no guardados).
                // Si no existe, usamos el valor que viene de la DB/inicialización de esta página.
                setAttendanceData(prev => {
                    const merged = { ...prev };

                    Object.keys(pageAttendance).forEach(studentId => {
                        // Solo asignamos si NO tenemos ya un valor local para este estudiante.
                        // Esto mantiene las selecciones si navegamos lejos y volvemos.
                        if (!merged.hasOwnProperty(studentId)) {
                            merged[studentId] = pageAttendance[studentId];
                        }
                    });

                    return merged;
                });

            } catch (error) {
                console.error("Error al cargar estudiantes y/o asistencias:", error);
                message.error("Error al cargar estudiantes o asistencias");
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchStudentsAndAttendance();
    }, [selectedClass, request, studentPagination.current, studentPagination.pageSize]);


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
        if (!selectedClass) return;

        // Enviamos SOLO los datos de los estudiantes visibles/cargados O todos los que tenemos en attendanceData?
        // Si paginamos, attendanceData puede tener claves de estudiantes de otras páginas.
        // Lo ideal es enviar TODO lo que tengamos en attendanceData para esta clase.
        // Pero attendanceData puede tener basura de otras clases si no limpiamos bien.
        // (Limpiamos en useEffect cuando cambia selectedClass).

        // Enviamos todo lo que hay en attendanceData.
        const attendanceArray = Object.keys(attendanceData).map(studentId => ({
            class_id: selectedClass.id,
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
    }, [selectedClass, attendanceData, request]);

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

        // Paginación Clases
        pagination,
        setPagination: handleTableChange,

        // Paginación Estudiantes
        studentPagination,
        setStudentPagination: handleStudentPageChange,

        // Propiedades para Checkbox "Marcar Todos"
        areAllFilteredPresent,
        isIndeterminate,

        // Metadata
        hasStudents: students.length > 0,
    };
};

export default useAttendanceData;