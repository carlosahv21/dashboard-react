import React, { useContext, useState } from "react";
import { Row, Col, Typography, Card, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { AuthContext } from "../../../context/AuthContext";
import { useRegistrations } from "../hooks/useRegistrations";

import AvailableClassesList from "../components/AvailableClassesList";
import RegistrationCalendar from "../components/RegistrationCalendar";
import StudentSelector from "../components/StudentSelector";

const { Title } = Typography;

const RegistrationPage = () => {
  const { user, hasPermission } = useContext(AuthContext);
  const isAdmin = hasPermission("registrations:create");
  const [classSearchQuery, setClassSearchQuery] = useState("");

  const {
    students,
    selectedStudentId,
    setSelectedStudentId,
    availableClasses,
    enrolledClasses,
    studentSearchTerm,
    loading,
    enroll,
    unenroll,
    debounceStudentSearch,
    debounceClassSearch,
  } = useRegistrations(user, isAdmin);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Title level={2} style={{ marginBottom: 32, marginTop: 0 }}>
        Inscripción de Clases
      </Title>

      {isAdmin && (
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <Title level={4} style={{ marginBottom: 16 }}>
            Seleccionar Estudiante
          </Title>
          <StudentSelector
            students={students}
            selectedStudentId={selectedStudentId}
            onStudentSelect={setSelectedStudentId}
            loading={loading}
            onStudentSearch={debounceStudentSearch}
            searchTerm={studentSearchTerm}
          />
        </Card>
      )}

      {selectedStudentId ? (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <Title level={4} style={{ marginBottom: 24 }}>
                Clases Disponibles
              </Title>
              <Input
                placeholder="Buscar clase"
                value={classSearchQuery}
                onChange={(e) => {
                  const term = e.target.value;
                  setClassSearchQuery(term);
                  debounceClassSearch(term);
                }}
                allowClear
                style={{ marginBottom: 24, borderRadius: 8 }}
                suffix={<SearchOutlined />}
              />
              <div
                className="custom-scroll"
                style={{
                  maxHeight: "600px",
                  overflowY: "auto",
                  paddingRight: "12px",
                }}
              >
                <AvailableClassesList
                  classes={availableClasses}
                  enrolledClassIds={enrolledClasses.map(
                    (c) => c.class_id || c.id
                  )}
                  onClassSelect={enroll}
                  searchTerm={classSearchQuery}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <Title level={4} style={{ marginBottom: 24 }}>
                Calendario de Clases
              </Title>
              <RegistrationCalendar
                enrolledClasses={enrolledClasses}
                onRemoveClass={unenroll}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <Title level={4} type="secondary">
            {isAdmin
              ? "Seleccione un estudiante para comenzar"
              : "Cargando información..."}
          </Title>
        </div>
      )}
    </div>
  );
};

export default RegistrationPage;
