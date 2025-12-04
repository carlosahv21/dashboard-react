// StudentList.js
import React from 'react';
import { Card, List, Spin, Empty, Typography, Input, Checkbox, Button, Avatar, Tag } from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const StudentList = ({ 
    selectedClass, 
    filteredStudents, 
    loadingStudents, 
    searchText, 
    setSearchText, 
    attendanceData, 
    handleToggleAttendance, 
    handleSelectAll, 
    saveAttendance, 
    isSaving,
    areAllFilteredPresent,
    isIndeterminate,
    hasStudents 
}) => {
    
    if (!selectedClass) {
        return (
            <Card style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Empty description="Selecciona una clase para registrar la asistencia" />
            </Card>
        );
    }

    return (
        <Card style={{ height: "100%", display: "flex", flexDirection: "column" }} bodyStyle={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Title level={4} style={{ marginBottom: 0 }}>Alumnos inscritos - {selectedClass.name}</Title>
            </div>

            <Input
                placeholder="Buscar alumno..."
                suffix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ marginBottom: 16, padding: "8px 12px" }}
            />

            <div style={{ flex: 1, overflowY: "auto" }}>
                {loadingStudents ? (
                    <div style={{ textAlign: "center", marginTop: 50 }}><Spin /></div>
                ) : filteredStudents.length === 0 && hasStudents ? (
                    <Empty description={`No se encontraron alumnos para "${searchText}"`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={filteredStudents}
                        header={
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 16px" }}>
                                <Text strong>Estudiante</Text>
                                <Checkbox
                                    onChange={e => handleSelectAll(e.target.checked)}
                                    checked={areAllFilteredPresent}
                                    indeterminate={isIndeterminate}
                                    disabled={filteredStudents.length === 0}
                                >
                                    Marcar Todos
                                </Checkbox>
                            </div>
                        }
                        renderItem={item => (
                            <List.Item
                                style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}
                                actions={[
                                    <Checkbox
                                        checked={!!attendanceData[item.user_id]}
                                        onChange={() => handleToggleAttendance(item.user_id)}
                                    />
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={item.avatar} icon={<UserOutlined />} />}
                                    title={item.name}
                                    description={attendanceData[item.user_id] ? <Tag color="success">Presente</Tag> : <Tag color="default">Ausente</Tag>}
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: <Empty description="Esta clase no tiene alumnos inscritos." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    />
                )}
            </div>

            <div style={{ marginTop: 16, borderTop: "1px solid #f0f0f0", paddingTop: 16, textAlign: "right" }}>
                <Button
                    type="primary"
                    size="large"
                    onClick={saveAttendance}
                    loading={isSaving}
                    disabled={!hasStudents || filteredStudents.length === 0}
                >
                    Guardar Asistencia
                </Button>
            </div>
        </Card>
    );
};

export default StudentList;