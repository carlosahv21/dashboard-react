import React, { useState, useEffect, useMemo } from "react";
import { message, Rate } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import dashboardService from "../services/dashboardService";
import { useTranslation } from "react-i18next";

/**
 * Hook to manage Teachers Participation report data.
 */
const useTeachersParticipation = (filters) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getTeachersParticipation(filters);
        const result = response.data;
        if (result?.success) {
          setTeacherData(result.data);
        } else {
          setTeacherData([]);
        }
      } catch (error) {
        console.error("Error al cargar participación de maestros:", error);
        message.error(t("dashboard.loadParticipationError"));
        setTeacherData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, t]);

  const calculateRating = (totalMinutes, classesCount) => {
    const minutes =
      typeof totalMinutes === "string" ? parseInt(totalMinutes) : totalMinutes;
    const classes =
      typeof classesCount === "string" ? parseInt(classesCount) : classesCount;

    const avgMinutesPerClass = classes > 0 ? minutes / classes : 0;

    if (avgMinutesPerClass >= 75 && classes >= 6) return 5;
    if (avgMinutesPerClass >= 60 && classes >= 5) return 4;
    if (avgMinutesPerClass >= 50 && classes >= 4) return 3;
    if (avgMinutesPerClass >= 40 && classes >= 3) return 2;
    return 1;
  };

  const processedData = useMemo(() => {
    const dataWithRating = teacherData.map((teacher, index) => ({
      key: index,
      ...teacher,
      rating: calculateRating(teacher.total_minutes, teacher.classes_count),
      fullName: `${teacher.first_name} ${teacher.last_name}`,
    }));

    return dataWithRating.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      const aMinutes =
        typeof a.total_minutes === "string"
          ? parseInt(a.total_minutes)
          : a.total_minutes;
      const bMinutes =
        typeof b.total_minutes === "string"
          ? parseInt(b.total_minutes)
          : b.total_minutes;
      return bMinutes - aMinutes;
    });
  }, [teacherData]);

  const columns = [
    {
      title: t('teachers.name_plural'),
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => (
        <span>
          <UserOutlined style={{ marginRight: 8 }} />
          {text}
        </span>
      ),
    },
    {
      title: t('classes.name_plural'),
      dataIndex: "classes_count",
      key: "classes_count",
      align: "center",
      render: (count) => (
        <span>
          <BookOutlined style={{ marginRight: 8, color: "#722ED1" }} />
          {count}
        </span>
      ),
    },
    {
      title: t('dashboard.totalMinutes'),
      dataIndex: "total_minutes",
      key: "total_minutes",
      align: "center",
      render: (minutes) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8, color: "#EB2F96" }} />
          {typeof minutes === "string" ? parseInt(minutes) : minutes}
        </span>
      ),
    },
    {
      title: t('dashboard.rating'),
      dataIndex: "rating",
      key: "rating",
      align: "center",
      render: (rating) => (
        <Rate disabled value={rating} style={{ fontSize: 16 }} />
      ),
    },
  ];

  return {
    teachersParticipationLoading: loading,
    teachersParticipationData: processedData,
    teachersParticipationColumns: columns,
  };
};

export default useTeachersParticipation;
