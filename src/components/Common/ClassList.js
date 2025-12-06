// ClassList.js
import React from 'react';
import { Card, List, Spin, Empty, Typography, Space, Avatar } from "antd"; // 💡 Importar Pagination
import { ClockCircleOutlined, BookOutlined } from "@ant-design/icons";

import PaginationControl from "./PaginationControl";

const { Title, Text } = Typography;

// 💡 Recibir la paginación y la función de cambio de página (onChange)
const ClassList = ({
    classes,
    selectedClass,
    setSelectedClass,
    loadingClasses,
    currentDaySpanish,
    pagination, // Nueva Prop
    onPageChange // Nueva Prop
}) => {
    return (
        <Card
            // Asegura que la tarjeta use la altura disponible
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            bodyStyle={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                padding: '24px' // Padding estándar de Card
            }}
        >
            {/* --- Encabezado --- */}
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 10 }}>Clases del día</Title>
                <Text type="secondary">{currentDaySpanish}</Text>
            </div>

            {/* --- Contenido (Lista y Spin) --- */}
            {loadingClasses ? (
                <div style={{ textAlign: "center", marginTop: 50 }}><Spin /></div>
            ) : classes.length > 0 ? (
                // 💡 Contenedor scrollable para la lista
                <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
                    <List
                        itemLayout="horizontal"
                        dataSource={classes}
                        // La paginación de Ant Design ya no es necesaria aquí, ya que la manejamos
                        // con el componente de paginación externo.
                        // pagination={false} 
                        renderItem={item => (
                            <List.Item
                                onClick={() => setSelectedClass(item)}
                                // Estilos de List.Item se mantienen
                                style={{
                                    cursor: "pointer",
                                    padding: "16px",
                                    borderRadius: "8px",
                                    backgroundColor: selectedClass?.id === item.id ? "rgba(24, 144, 255, 0.1)" : "#f9f9f9",
                                    border: selectedClass?.id === item.id ? "1px solid #1890ff" : "1px solid #f0f0f0",
                                    marginBottom: 8,
                                    transition: "all 0.3s",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                {/* Contenido del Item (se mantiene) */}
                                <Space size="middle" style={{ flexGrow: 1, minWidth: 0 }}>
                                    <Avatar
                                        icon={<BookOutlined />}
                                        shape="square"
                                        size="large"
                                        style={{ backgroundColor: selectedClass?.id === item.id ? "#1890ff" : "#597ef7" }}
                                    />
                                    <Text
                                        strong={selectedClass?.id === item.id}
                                        ellipsis={true}
                                        style={{ fontSize: '16px' }}
                                    >
                                        {item.name}
                                    </Text>
                                </Space>
                                <div style={{ marginLeft: 'auto' }}>
                                    <Space size={4} style={{ flexShrink: 0 }}>
                                        <ClockCircleOutlined style={{ color: selectedClass?.id === item.id ? "#1890ff" : "rgba(0, 0, 0, 0.45)", fontSize: '14px' }} />
                                        <Text
                                            type="secondary"
                                            strong={selectedClass?.id === item.id}
                                            style={{ fontSize: '14px' }}
                                        >
                                            {item.hour || "N/A"}
                                        </Text>
                                    </Space>
                                </div>
                            </List.Item>
                        )}
                    />
                </div>
            ) : (
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "#ccc" }}>
                    <Empty description="No hay clases para hoy" />
                </div>
            )}

            {/* --- Paginación --- */}
            {classes.length > 0 && pagination.total > pagination.pageSize && (
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', padding: '16px 0 0' }}>
                    <PaginationControl
                        page={pagination.current}
                        total={pagination.total}
                        pageSize={pagination.pageSize}
                        onChange={onPageChange}
                    />
                </div>
            )}
        </Card>
    );
};

export default ClassList;