// Attendances.js (Ajustado para pasar la paginación a ClassList)

import React from "react";
import { Row, Col, Typography } from "antd";

import useAttendanceData from "../../hooks/useAttendanceData";
import ClassList from "../../components/Common/ClassList";
import StudentList from "../../components/Common/StudentList";

const { Title } = Typography;

const Attendances = () => {

    const {
        classes,
        selectedClass,
        setSelectedClass,
        loadingClasses,
        currentDaySpanish,

        filteredStudents,
        loadingStudents,
        attendanceData,
        searchText,
        setSearchText,

        handleToggleAttendance,
        handleSelectAll,
        saveAttendance,
        isSaving,

        pagination,
        setPagination,

        areAllFilteredPresent,
        isIndeterminate,
        hasStudents
    } = useAttendanceData();

    const handlePageChange = (page, pageSize) => {
        setPagination(page, pageSize);
    };

    return (
        <>
            <Title level={2} style={{ marginBottom: 16, marginTop: 0 }}>Asistencias</Title>

            <Row gutter={[24, 24]}>
                {/* Columna Izquierda: Lista de Clases */}
                <Col xs={24} lg={8} style={{ minHeight: "calc(85vh - 100px)" }}>
                    <ClassList
                        classes={classes}
                        selectedClass={selectedClass}
                        setSelectedClass={setSelectedClass}
                        loadingClasses={loadingClasses}
                        currentDaySpanish={currentDaySpanish}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                    />
                </Col>

                {/* Columna Derecha: Lista de Estudiantes y Controles (Se mantiene igual) */}
                <Col xs={24} lg={16} style={{ minHeight: "calc(85vh - 100px)" }}>
                    <StudentList
                        selectedClass={selectedClass}
                        filteredStudents={filteredStudents}
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
                    />
                </Col>
            </Row>
        </>
    );
};

export default Attendances;