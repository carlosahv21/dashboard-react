import { useState, useEffect, useCallback, useMemo } from "react";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import registrationService from "../services/registrationService";

export const useRegistrations = (user, isAdmin) => {
  const { t } = useTranslation();
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
      message.error(t("registrations.loadAvailableClassesError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
      message.error(t("registrations.loadStudentsError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
      message.error(t("registrations.loadClassesError"));
    } finally {
      setLoading(false);
    }
  }, [fetchInitialClasses, t]);

  const fetchEnrollments = useCallback(async (studentId) => {
    try {
      setLoading(true);
      const res = await registrationService.getEnrollments(studentId);
      setEnrolledClasses(res.data?.data || res.data || []);
    } catch (error) {
      message.error(t("registrations.loadEnrollmentsError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const enroll = async (classItem) => {
    if (!selectedStudentId) {
      message.warning(t("registrations.selectStudentFirst"));
      return;
    }
    try {
      await registrationService.enroll(selectedStudentId, classItem.id);
      message.success(t("registrations.enrollSuccess", { name: classItem.name }));
      fetchEnrollments(selectedStudentId);
    } catch (error) {
      message.error(error.response?.data?.message || t("registrations.enrollError"));
    }
  };

  const unenroll = async (classItem) => {
    try {
      await registrationService.unenroll(classItem.id);
      message.success(t("registrations.unenrollSuccess"));
      fetchEnrollments(selectedStudentId);
    } catch (error) {
      message.error(t("registrations.unenrollError"));
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
