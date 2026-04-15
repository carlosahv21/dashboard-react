import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import attendanceService from "../services/attendanceService";
import "dayjs/locale/es";
import "dayjs/locale/en";

dayjs.locale("es");

const getCurrentDayEnglish = () => dayjs().locale("en").format("dddd");
const getCurrentDate = () => dayjs().format("YYYY-MM-DD");

export const useAttendance = () => {
  // --- Classes State ---
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
  });

  // --- Students State ---
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [searchText, setSearchText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [studentPagination, setStudentPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
  });

  const currentDaySpanish = dayjs().locale("es").format("dddd");
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);
  const prevClassIdRef = useRef(selectedClass?.id);

  // Pagination Handlers
  const handleTableChange = useCallback((page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  }, []);

  const handleStudentPageChange = useCallback((page, pageSize) => {
    setStudentPagination((prev) => ({ ...prev, current: page, pageSize }));
  }, []);

  // Debouncing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch Classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const day = getCurrentDayEnglish();
        const res = await attendanceService.getClasses(
          day,
          pagination.current,
          pagination.pageSize
        );
        const allClasses = res.data?.data || res.data || [];
        const total = res.data?.total || res.total || 0;

        setClasses(allClasses);
        setPagination((prev) => ({
          ...prev,
          total,
          current:
            allClasses.length === 0 && prev.current > 1
              ? prev.current - 1
              : prev.current,
        }));

        if (allClasses.length > 0 && !selectedClass) {
          const now = dayjs();
          const nearest = allClasses.reduce((prev, curr) => {
            const [pH, pM] = (prev.hour || "00:00").split(":");
            const [cH, cM] = (curr.hour || "00:00").split(":");
            const pDiff = Math.abs(dayjs().hour(pH).minute(pM).diff(now));
            const cDiff = Math.abs(dayjs().hour(cH).minute(cM).diff(now));
            return pDiff < cDiff ? prev : curr;
          });
          setSelectedClass(nearest);
        }
      } catch (error) {
        message.error("Error al cargar las clases");
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [pagination.current, pagination.pageSize, selectedClass]);

  // Fetch Students and Attendance
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setAttendanceData({});
      setStudentPagination((prev) => ({ ...prev, total: 0, current: 1 }));
      return;
    }

    const fetchData = async () => {
      try {
        setLoadingStudents(true);
        const classChanged = prevClassIdRef.current !== selectedClass.id;
        let validPage = studentPagination.current;

        if (classChanged) {
          prevClassIdRef.current = selectedClass.id;
          validPage = 1;
          setStudentPagination((prev) => ({ ...prev, current: 1 }));
        }

        const studentsRes = await attendanceService.getRegistrations(
          selectedClass.id,
          validPage,
          studentPagination.pageSize,
          debouncedSearchText
        );
        const sList =
          studentsRes.data?.data?.map((reg) => ({
            user_id: reg.user_id,
            name: `${reg.user_first_name} ${reg.user_last_name}`,
            avatar: reg.user_avatar,
            ...reg,
          })) ||
          studentsRes.data?.map((reg) => ({
            user_id: reg.user_id,
            name: `${reg.user_first_name} ${reg.user_last_name}`,
            avatar: reg.user_avatar,
            ...reg,
          })) ||
          [];

        setStudents(sList);
        setStudentPagination((prev) => ({
          ...prev,
          total: studentsRes.data?.total || studentsRes.total || 0,
        }));

        const today = getCurrentDate();
        const attRes = await attendanceService.getAttendance(selectedClass.id, today);
        const existingAtt = attRes.data?.data || attRes.data || [];
        const pageAtt = {};

        sList.forEach((s) => (pageAtt[String(s.user_id)] = false));
        existingAtt.forEach((record) => {
          if (record.status?.toLowerCase() === "present") {
            pageAtt[String(record.student_id)] = true;
          }
        });

        setAttendanceData((prev) => (classChanged ? pageAtt : { ...prev, ...pageAtt }));
      } catch (error) {
        message.error("Error al cargar estudiantes");
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchData();
  }, [
    selectedClass,
    studentPagination.current,
    studentPagination.pageSize,
    debouncedSearchText
  ]);

  const handleToggleAttendance = (studentId) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleSelectAll = (checked) => {
    const newData = { ...attendanceData };
    students.forEach((s) => (newData[s.user_id] = checked));
    setAttendanceData(newData);
  };

  const saveAttendance = async () => {
    if (!selectedClass) return;
    try {
      setIsSaving(true);
      const allRegRes = await attendanceService.getAllRegistrations(selectedClass.id);
      const allReg = allRegRes.data?.data || allRegRes.data || [];

      if (allReg.length === 0) {
        message.warning("No hay estudiantes registrados.");
        return;
      }

      const today = getCurrentDate();
      const payload = allReg.map((s) => ({
        class_id: selectedClass.id,
        student_id: s.user_id,
        date: today,
        status: attendanceData[String(s.user_id)] ? "Present" : "Absent",
      }));

      await attendanceService.saveAttendance(payload);
      message.success("Asistencia guardada con éxito");
    } catch (error) {
      message.error(error.response?.data?.message || "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const areAllFilteredPresent =
    students.length > 0 && students.every((s) => attendanceData[s.user_id]);
  const isIndeterminate =
    students.some((s) => attendanceData[s.user_id]) && !areAllFilteredPresent;

  return {
    classes,
    selectedClass,
    setSelectedClass,
    loadingClasses,
    currentDaySpanish,
    students,
    loadingStudents,
    attendanceData,
    searchText,
    setSearchText,
    isSaving,
    pagination,
    setPagination: handleTableChange,
    studentPagination,
    setStudentPagination: handleStudentPageChange,
    handleToggleAttendance,
    handleSelectAll,
    saveAttendance,
    areAllFilteredPresent,
    isIndeterminate,
    hasStudents: students.length > 0,
  };
};
