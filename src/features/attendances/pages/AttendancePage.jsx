import React from "react";
import { Row, Col, Typography } from "antd";
import { useAttendance } from "../hooks/useAttendance";
import ClassList from "../components/ClassList";
import StudentList from "../components/StudentList";

const { Title } = Typography;

const AttendancePage = () => {
  const {
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
    setPagination,
    studentPagination,
    setStudentPagination,
    handleToggleAttendance,
    handleSelectAll,
    saveAttendance,
    areAllFilteredPresent,
    isIndeterminate,
    hasStudents,
  } = useAttendance();

  return (
    <div style={{ minHeight: "100vh" }}>
      <Title level={2} style={{ marginBottom: 32, marginTop: 0 }}>
        Asistencias
      </Title>

      <Row gutter={[24, 24]}>
        {/* Left Column: Class List */}
        <Col xs={24} lg={8}>
          <ClassList
            classes={classes}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            loadingClasses={loadingClasses}
            currentDaySpanish={currentDaySpanish}
            pagination={pagination}
            onPageChange={setPagination}
          />
        </Col>

        {/* Right Column: Student List and Controls */}
        <Col xs={24} lg={16}>
          <StudentList
            selectedClass={selectedClass}
            filteredStudents={students}
            loadingStudents={loadingStudents}
            searchText={searchText}
            setSearchText={setSearchText}
            attendanceData={attendanceData}
            handleToggleAttendance={handleToggleAttendance}
            handleSelectAll={handleSelectAll}
            saveAttendance={saveAttendance}
            isSaving={isSaving}
            areAllFilteredPresent={areAllFilteredPresent}
            isIndeterminate={isIndeterminate}
            hasStudents={hasStudents}
            pagination={studentPagination}
            onPageChange={setStudentPagination}
          />
        </Col>
      </Row>
    </div>
  );
};

export default AttendancePage;
