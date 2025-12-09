import React, { useState, useEffect, useContext, useMemo } from "react";
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
    const [students, setStudents] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [enrolledClasses, setEnrolledClasses] = useState([]);
    const [classSearchQuery, setClassSearchQuery] = useState("");
    const [studentSearchTerm, setStudentSearchTerm] = useState("");

    const isAdmin = hasPermission("registrations:create");

    const fetchStudents = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 3) {
            setStudents([]);
            return;
        }

        try {
            let url = `students?role_id=2&limit=50&search=${searchTerm}&order_by=first_name&order_direction=asc`;

            const data = await request(url, "GET");
            setStudents(data.data || []);

        } catch (error) {
            message.error("Error al cargar estudiantes");
            setStudents([]);
        }
    };

    const fetchClasses = async (searchTerm) => {
        if (!searchTerm || searchTerm.length === 0) {
            fetchInitialClasses();
            return;
        }

        if (searchTerm.length < 3) {
            setAvailableClasses([]);
            return;
        }

        try {
            let url = `classes?limit=50&search=${searchTerm}&order_by=name&order_direction=asc`;
            const data = await request(url, "GET");
            setAvailableClasses(data.data || []);
        } catch (error) {
            message.error("Error al cargar clases");
            setAvailableClasses([]);
        }
    };

    const fetchInitialClasses = async () => {
        try {
            const data = await request("classes?is_favorites=true&order_by=name&order_direction=asc", "GET");
            setAvailableClasses(data.data || []);
        } catch (error) {
            message.error("Error al cargar clases disponibles");
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

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    const debounceStudentSearch = useMemo(() => {
        return debounce((searchTerm) => {
            setStudentSearchTerm(searchTerm);
            fetchStudents(searchTerm);
        }, 300);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [request]);

    const debounceClassSearch = useMemo(() => {
        return debounce((searchTerm) => {
            fetchClasses(searchTerm);
        }, 300);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [request]);

    useEffect(() => {
        if (isAdmin) {
        } else if (user) {
            setSelectedStudentId(user.id);
            fetchInitialClasses();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin, user]);

    useEffect(() => {
        if (selectedStudentId) {
            fetchEnrollments(selectedStudentId);
            fetchInitialClasses();
        } else {
            setEnrolledClasses([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStudentId]);

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
        <>
            <Title level={2} style={{ marginBottom: 16, marginTop: 0 }}>Inscripción de Clases</Title>

            {isAdmin && (
                <Card style={{ marginBottom: 24 }}>
                    <Title level={4}>Seleccionar Estudiante</Title>
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
                        <Card>
                            <Title level={4} style={{ marginBottom: 30 }}>Clases Disponibles</Title>
                            <Input
                                placeholder="Buscar clase"
                                value={classSearchQuery}
                                onChange={(e) => {
                                    const term = e.target.value;
                                    setClassSearchQuery(term);
                                    debounceClassSearch(term);
                                }}
                                allowClear
                                style={{ marginBottom: 24 }}
                                suffix={<SearchOutlined />}
                            />
                            <div style={{ maxHeight: "800px", overflowY: "auto", overflowX: "hidden" }}>
                                <AvailableClassesList
                                    classes={availableClasses}
                                    enrolledClassIds={enrolledClasses.map(c => c.class_id || c.id)}
                                    onClassSelect={handleEnroll}
                                    searchTerm={classSearchQuery}
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
        </>
    );
};

export default Registration;