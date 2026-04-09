import { useState, useEffect, useCallback, useMemo } from "react";
import { message } from "antd";
import registrationService from "../services/registrationService";

export const useRegistrations = (user, isAdmin) => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchInitialClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await registrationService.getFavoriteClasses();
      setAvailableClasses(res.data?.data || res.data || []);
    } catch (error) {
      message.error("Error al cargar clases disponibles");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) {
      setStudents([]);
      return;
    }
    try {
      setLoading(true);
      const res = await registrationService.getStudents(searchTerm);
      setStudents(res.data?.data || res.data || []);
    } catch (error) {
      message.error("Error al cargar estudiantes");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length === 0) {
      fetchInitialClasses();
      return;
    }
    if (searchTerm.length < 3) {
      setAvailableClasses([]);
      return;
    }
    try {
      setLoading(true);
      const res = await registrationService.getClasses(searchTerm);
      setAvailableClasses(res.data?.data || res.data || []);
    } catch (error) {
      message.error("Error al cargar clases");
    } finally {
      setLoading(false);
    }
  }, [fetchInitialClasses]);

  const fetchEnrollments = useCallback(async (studentId) => {
    try {
      setLoading(true);
      const res = await registrationService.getEnrollments(studentId);
      setEnrolledClasses(res.data?.data || res.data || []);
    } catch (error) {
      message.error("Error al cargar inscripciones");
    } finally {
      setLoading(false);
    }
  }, []);

  const enroll = async (classItem) => {
    if (!selectedStudentId) {
      message.warning("Por favor seleccione un estudiante primero");
      return;
    }
    try {
      await registrationService.enroll(selectedStudentId, classItem.id);
      message.success(`Inscrito correctamente en ${classItem.name}`);
      fetchEnrollments(selectedStudentId);
    } catch (error) {
      message.error(error.response?.data?.message || "Error al inscribir");
    }
  };

  const unenroll = async (classItem) => {
    try {
      await registrationService.unenroll(classItem.id);
      message.success("Clase dada de baja correctamente");
      fetchEnrollments(selectedStudentId);
    } catch (error) {
      message.error("Error al dar de baja");
    }
  };

  // Debouncing logic
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debounceStudentSearch = useMemo(
    () => debounce((term) => fetchStudents(term), 300),
    [fetchStudents]
  );
  const debounceClassSearch = useMemo(
    () => debounce((term) => fetchClasses(term), 300),
    [fetchClasses]
  );

  useEffect(() => {
    if (!isAdmin && user?.id) {
      setSelectedStudentId(user.id);
    }
  }, [isAdmin, user]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchEnrollments(selectedStudentId);
      fetchInitialClasses();
    } else {
      setEnrolledClasses([]);
    }
  }, [selectedStudentId, fetchEnrollments, fetchInitialClasses]);

  return {
    students,
    selectedStudentId,
    setSelectedStudentId,
    availableClasses,
    enrolledClasses,
    studentSearchTerm,
    setStudentSearchTerm,
    loading,
    enroll,
    unenroll,
    debounceStudentSearch,
    debounceClassSearch,
  };
};
