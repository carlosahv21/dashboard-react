import { useState, useEffect, useCallback, useRef } from "react";
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

    // 3. Debounce de SearchText
    const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    // Ref para rastrear la clase anterior y limpiar estados
    const prevClassIdRef = useRef(selectedClass?.id);

    // 2. Fetch de Estudiantes y Asistencias
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

                // Detectar si cambió la clase para reiniciar la asistencia local y Paginación
                const classChanged = prevClassIdRef.current !== selectedClass.id;
                let validCurrent = current;

                if (classChanged) {
                    prevClassIdRef.current = selectedClass.id;
                    validCurrent = 1;
                    setStudentPagination(prev => ({ ...prev, current: 1 }));
                }

                // --- 2.1. Fetch de Estudiantes (Registrations) con BÚSQUEDA ---
                const searchParam = debouncedSearchText ? `&search=${encodeURIComponent(debouncedSearchText)}` : "";
                const studentsResponse = await request(`registrations?class_id=${selectedClass.id}&page=${validCurrent}&limit=${pageSize}${searchParam}`, "GET");

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

                // --- 2.2. Fetch de Asistencia Existente ---
                const todayDate = getCurrentDate();
                const attendanceResponse = await request(`attendance?class_id=${selectedClass.id}&date=${todayDate}&limit=1000`, "GET");
                const existingAttendance = attendanceResponse.data || [];

                // 3. Fusionar datos existentes
                const pageAttendance = {};

                // Inicializar con false
                studentsList.forEach(s => {
                    pageAttendance[String(s.user_id)] = false;
                });

                // Actualizar con DB
                existingAttendance.forEach(record => {
                    const isPresent = record.status?.toLowerCase() === "present";
                    const studentIdStr = String(record.student_id);
                    pageAttendance[studentIdStr] = isPresent;
                });

                // 4. Actualizar el estado de asistencia
                setAttendanceData(prev => {
                    // Si cambió la clase, NO fusionamos con el anterior (reinicio)
                    if (classChanged) {
                        return pageAttendance;
                    }

                    // Si NO cambió la clase, fusionamos para mantener estados de otras páginas
                    const merged = { ...prev };
                    Object.keys(pageAttendance).forEach(studentId => {
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
    }, [selectedClass, request, studentPagination.current, studentPagination.pageSize, debouncedSearchText]);

    // Al cambiar el texto de búsqueda, reseteamos a la página 1 para evitar estar en pág 10 con 1 resultado
    useEffect(() => {
        setStudentPagination(prev => ({ ...prev, current: 1 }));
    }, [debouncedSearchText]);


    // 3. Lógica de Filtrado (Ahora es passthrough ya que el backend filtra)
    // Mantenemos el nombre 'filteredStudents' y la estructura para no romper la vista
    const filteredStudents = students;

    // 4. Handlers de Asistencia (Optimizadas con useCallback)
    const handleToggleAttendance = useCallback((studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    }, []);

    const handleSelectAll = useCallback((checked) => {
        const newData = { ...attendanceData };
        // Solo afecta a los estudiantes visibles (filteredStudents = students de la página actual)
        filteredStudents.forEach(s => {
            newData[s.user_id] = checked;
        });
        setAttendanceData(newData);
    }, [attendanceData, filteredStudents]);

    // Comprueba si todos los estudiantes visibles están marcados
    const areAllFilteredPresent = filteredStudents.length > 0 &&
        filteredStudents.every(s => attendanceData[s.user_id]);

    // Comprueba si ALGUNOS (pero no todos) los estudiantes visibles están marcados
    const isIndeterminate = filteredStudents.some(s => attendanceData[s.user_id]) &&
        !areAllFilteredPresent;

    // 5. Función de Guardado (Optimizada con useCallback)
    const saveAttendance = useCallback(async () => {
        if (!selectedClass) return;

        try {
            setIsSaving(true);

            const allStudentsResponse = await request(`registrations?class_id=${selectedClass.id}&limit=1000`, "GET");
            const allStudents = allStudentsResponse.data || [];

            if (allStudents.length === 0) {
                message.warning("No se encontraron estudiantes para esta clase.");
                return;
            }

            const attendanceArray = allStudents.map(student => {
                const studentId = String(student.user_id);
                const isPresent = attendanceData.hasOwnProperty(studentId) ? attendanceData[studentId] : false;

                return {
                    class_id: selectedClass.id,
                    student_id: student.user_id,
                    date: dayjs().format("YYYY-MM-DD"),
                    status: isPresent ? "Present" : "Absent"
                };
            });

            if (attendanceArray.length === 0) {
                message.warning("No hay registros de asistencia para enviar.");
                return;
            }

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
        filteredStudents, // Esto ahora viene filtrado del backend
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