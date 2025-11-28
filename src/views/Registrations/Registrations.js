import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Typography, message, Card, Input } from "antd";
import useFetch from "../../hooks/useFetch";
import { AuthContext } from "../../context/AuthContext";
import AvailableClassesList from "../../components/Common/AvailableClassesList";
import RegistrationCalendar from "../../components/Common/RegistrationsCalendar";
import StudentSelector from "../../components/Common/StudentSelector";
import { SearchOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Registration = () => {
    const { user, hasPermission } = useContext(AuthContext);
    const { request, loading } = useFetch();

    // State
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [enrolledClasses, setEnrolledClasses] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const isAdmin = hasPermission("registrations:create");

    // Initial load
    useEffect(() => {
        fetchAvailableClasses();
        if (isAdmin) {
            fetchStudents();
        } else if (user) {
            // If student, set self as selected
            setSelectedStudentId(user.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin, user]);

    // Fetch enrollments when student changes
    useEffect(() => {
        if (selectedStudentId) {
            fetchEnrollments(selectedStudentId);
        } else {
            setEnrolledClasses([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStudentId]);

    const fetchAvailableClasses = async () => {
        try {
            const data = await request("classes?limit=4", "GET");
            setAvailableClasses(data.data || []);
        } catch (error) {
            message.error("Error al cargar clases disponibles");
        }
    };

    const fetchStudents = async () => {
        try {
            const data = await request("students", "GET");
            setStudents(data.data || []);
        } catch (error) {
            message.error("Error al cargar estudiantes");
        }
    };

    const fetchEnrollments = async (studentId) => {
        try {
            const data = await request(`registrations?user_id=${studentId}`, "GET");
            setEnrolledClasses(data.data || []);
        } catch (error) {
            message.error("Error al cargar inscripciones");
        }
    };

    const handleEnroll = async (classItem) => {
        if (!selectedStudentId) {
            message.warning("Por favor seleccione un estudiante primero");
            return;
        }

        try {
            await request("registrations", "POST", {
                user_id: selectedStudentId,
                class_id: classItem.id
            });
            message.success(`Inscrito correctamente en ${classItem.name}`);
            fetchEnrollments(selectedStudentId);
        } catch (error) {
            message.error(error.message || "Error al inscribir en la clase");
        }
    };

    const handleUnenroll = async (classItem) => {
        try {
            await request(`registrations/${classItem.id}`, "DELETE");

            message.success("Clase dada de baja correctamente");
            fetchEnrollments(selectedStudentId);
        } catch (error) {
            message.error("Error al dar de baja la clase");
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Inscripción de Clases</Title>

            {isAdmin && (
                <Card style={{ marginBottom: 24 }}>
                    <Title level={4}>Seleccionar Estudiante</Title>
                    <StudentSelector
                        students={students}
                        selectedStudentId={selectedStudentId}
                        onStudentSelect={setSelectedStudentId}
                        loading={loading}
                    />
                </Card>
            )}

            {selectedStudentId ? (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <Card>
                            <Title level={4} style={{ marginBottom: 30 }}>Clases Disponibles</Title>
                            <Input
                                placeholder="Buscar clase"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ marginBottom: 24 }}
                                suffix={<SearchOutlined />}
                            />
                            <div style={{ maxHeight: "800px", overflowY: "auto", overflowX: "hidden" }}>
                                <AvailableClassesList
                                    classes={availableClasses}
                                    enrolledClassIds={enrolledClasses.map(c => c.class_id || c.id)}
                                    onClassSelect={handleEnroll}
                                />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={16}>
                        <Card>
                            <Title level={4}>Calendario de Clases</Title>
                            <RegistrationCalendar
                                enrolledClasses={enrolledClasses}
                                onRemoveClass={handleUnenroll}
                            />
                        </Card>
                    </Col>
                </Row>
            ) : (
                <div style={{ textAlign: "center", marginTop: 50 }}>
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

export default Registration;
