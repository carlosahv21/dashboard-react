import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";
import useFetch from "./useFetch";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "dayjs/locale/en";

dayjs.locale("es");

// Función auxiliar para obtener el día actual en inglés (para el filtro de API/DB)
const getCurrentDayEnglish = () =>
    dayjs().locale("en").format("dddd").toLowerCase();

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
        setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: pageSize,
        }));
    }, []);

    // Función para manejar el cambio de página/tamaño (Estudiantes)
    const handleStudentPageChange = useCallback((page, pageSize) => {
        setStudentPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: pageSize,
        }));
    }, []);

    // 1. Fetch de Clases (Depende de la paginación)
    const { current: currentClassPage, pageSize: currentClassPageSize } =
        pagination;
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoadingClasses(true);
                const today = getCurrentDayEnglish();

                // Agregar parámetros de paginación a la URL
                const url = `classes?date=${today}&page=${currentClassPage}&limit=${currentClassPageSize}&order_by=hour&order_direction=asc`;
                const response = await request(url, "GET");

                const allClasses = response.data || [];
                const total = response.total || 0;

                setClasses(allClasses);

                setPagination((prev) => ({
                    ...prev,
                    total,
                    current:
                        allClasses.length === 0 && currentClassPage > 1
                            ? currentClassPage - 1
                            : currentClassPage,
                }));

                if (allClasses.length > 0) {
                    setClasses((prevClasses) => {
                        return allClasses;
                    });

                    setSelectedClass((prevSelected) => {
                        if (prevSelected) return prevSelected;

                        const now = dayjs();
                        return allClasses.reduce((prev, current) => {
                            // "hour" is likely "HH:mm:ss" or "HH:mm". We need to attach proper date.
                            const [prevH, prevM] = (prev.hour || "00:00").split(":");
                            const [currH, currM] = (current.hour || "00:00").split(":");

                            const prevDate = dayjs().hour(prevH).minute(prevM);
                            const currDate = dayjs().hour(currH).minute(currM);

                            const prevDiff = Math.abs(prevDate.diff(now));
                            const currDiff = Math.abs(currDate.diff(now));

                            return prevDiff < currDiff ? prev : current;
                        });
                    });
                }
            } catch (error) {
                console.error(error);
                message.error("Error al cargar las clases");
            } finally {
                setLoadingClasses(false);
            }
        };
        fetchClasses();
    }, [request, currentClassPage, currentClassPageSize]);

    const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    const prevClassIdRef = useRef(selectedClass?.id);

    const { current: currentStudentPage, pageSize: currentStudentPageSize } =
        studentPagination;
    useEffect(() => {
        if (!selectedClass) {
            setStudents([]);
            setAttendanceData({});
            setStudentPagination((prev) => ({ ...prev, total: 0, current: 1 }));
            return;
        }

        const fetchStudentsAndAttendance = async () => {
            try {
                setLoadingStudents(true);

                const classChanged = prevClassIdRef.current !== selectedClass.id;
                let validCurrent = currentStudentPage;

                if (classChanged) {
                    prevClassIdRef.current = selectedClass.id;
                    validCurrent = 1;
                    setStudentPagination((prev) => ({ ...prev, current: 1 }));
                }

                const searchParam = debouncedSearchText
                    ? `&search=${encodeURIComponent(debouncedSearchText)}`
                    : "";
                const studentsResponse = await request(
                    `registrations?class_id=${selectedClass.id}&page=${validCurrent}&limit=${currentStudentPageSize}${searchParam}&order_by=u.first_name&order_direction=asc`,
                    "GET"
                );

                const studentsList =
                    studentsResponse.data?.map((reg) => ({
                        user_id: reg.user_id,
                        name:
                            `${reg.user_first_name} ${reg.user_last_name}` || "Estudiante",
                        avatar: reg.user_avatar,
                        ...reg,
                    })) || [];

                setStudents(studentsList);
                setStudentPagination((prev) => ({
                    ...prev,
                    total: studentsResponse.total || 0,
                }));

                const todayDate = getCurrentDate();
                const attendanceResponse = await request(
                    `attendance?class_id=${selectedClass.id}&date=${todayDate}&limit=1000`,
                    "GET"
                );
                const existingAttendance = attendanceResponse.data || [];
                const pageAttendance = {};

                studentsList.forEach((s) => {
                    pageAttendance[String(s.user_id)] = false;
                });

                existingAttendance.forEach((record) => {
                    const isPresent = record.status?.toLowerCase() === "present";
                    const studentIdStr = String(record.student_id);
                    pageAttendance[studentIdStr] = isPresent;
                });

                setAttendanceData((prev) => {
                    if (classChanged) {
                        return pageAttendance;
                    }

                    const merged = { ...prev };
                    Object.keys(pageAttendance).forEach((studentId) => {
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
    }, [
        selectedClass,
        request,
        currentStudentPage,
        currentStudentPageSize,
        debouncedSearchText,
    ]);

    useEffect(() => {
        setStudentPagination((prev) => ({ ...prev, current: 1 }));
    }, [debouncedSearchText]);

    const filteredStudents = students;

    const handleToggleAttendance = useCallback((studentId) => {
        setAttendanceData((prev) => ({
            ...prev,
            [studentId]: !prev[studentId],
        }));
    }, []);

    const handleSelectAll = useCallback(
        (checked) => {
            const newData = { ...attendanceData };
            filteredStudents.forEach((s) => {
                newData[s.user_id] = checked;
            });
            setAttendanceData(newData);
        },
        [attendanceData, filteredStudents]
    );

    const areAllFilteredPresent =
        filteredStudents.length > 0 &&
        filteredStudents.every((s) => attendanceData[s.user_id]);

    const isIndeterminate =
        filteredStudents.some((s) => attendanceData[s.user_id]) &&
        !areAllFilteredPresent;

    const saveAttendance = useCallback(async () => {
        if (!selectedClass) return;

        try {
            setIsSaving(true);

            const allStudentsResponse = await request(
                `registrations?class_id=${selectedClass.id}&limit=1000`,
                "GET"
            );
            const allStudents = allStudentsResponse.data || [];

            if (allStudents.length === 0) {
                message.warning("No se encontraron estudiantes para esta clase.");
                return;
            }

            const attendanceArray = allStudents.map((student) => {
                const studentId = String(student.user_id);
                const isPresent = attendanceData.hasOwnProperty(studentId)
                    ? attendanceData[studentId]
                    : false;

                return {
                    class_id: selectedClass.id,
                    student_id: student.user_id,
                    date: dayjs().format("YYYY-MM-DD"),
                    status: isPresent ? "Present" : "Absent",
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
            message.error(error.message);
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
