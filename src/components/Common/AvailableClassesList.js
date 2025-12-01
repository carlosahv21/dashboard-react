import React from "react";
import { List, Card, Tag, Typography, Empty } from "antd";
import { ClockCircleOutlined, CalendarOutlined, TeamOutlined, TrophyOutlined } from "@ant-design/icons";

const { Text } = Typography;

// Función auxiliar para resaltar el texto que coincide con la búsqueda
const highlightMatch = (text, query) => {
    // Si no hay término de búsqueda o es muy corto, devolvemos el texto normal.
    if (!query || query.length < 3) {
        return text;
    }

    const parts = [];
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let lastIndex = 0;

    // Buscamos todas las ocurrencias del query en el texto
    for (let i = 0; i <= lowerText.length - lowerQuery.length; i++) {
        if (lowerText.substring(i, i + lowerQuery.length) === lowerQuery) {
            // 1. Añadir el texto antes de la coincidencia
            if (i > lastIndex) {
                parts.push(<span key={`pre-${lastIndex}`}>{text.substring(lastIndex, i)}</span>);
            }
            // 2. Añadir la coincidencia en negrita (<strong>)
            parts.push(<strong key={`match-${i}`}>{text.substring(i, i + lowerQuery.length)}</strong>);
            lastIndex = i + lowerQuery.length;
            i += lowerQuery.length - 1; // Continuar la búsqueda después de la coincidencia
        }
    }

    // 3. Añadir el texto restante
    if (lastIndex < text.length) {
        parts.push(<span key={`post-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }

    // Devolvemos un span con todas las partes
    return <span>{parts}</span>;
};


const AvailableClassesList = ({ classes, onClassSelect, enrolledClassIds = [], searchTerm }) => {
    if (!classes || classes.length === 0) {
        // Mejoramos el mensaje cuando se está buscando pero no hay resultados
        const description = searchTerm && searchTerm.length >= 3
            ? "No se encontraron clases que coincidan con la búsqueda."
            : "No hay clases disponibles o escriba al menos 3 caracteres para buscar.";

        return <Empty description={description} />;
    }

    return (
        <List
            grid={{
                gutter: 16,
                xs: 1,
                sm: 1,
                md: 1,
                lg: 1,
                xl: 1,
                xxl: 1,
            }}
            dataSource={classes}
            renderItem={(classItem) => {
                const isEnrolled = enrolledClassIds.includes(classItem.id);

                return (
                    <List.Item>
                        <Card
                            hoverable={!isEnrolled}
                            onClick={() => !isEnrolled && onClassSelect(classItem)}
                            style={{
                                opacity: isEnrolled ? 0.6 : 1,
                                cursor: isEnrolled ? "not-allowed" : "pointer",
                                borderColor: isEnrolled ? "#52c41a" : undefined,
                            }}
                        >
                            <div style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 16 }}>
                                    {highlightMatch(classItem.name, searchTerm)}
                                </Text>
                                {isEnrolled && (
                                    <Tag color="success" style={{ marginLeft: 8 }}>
                                        Inscrito
                                    </Tag>
                                )}
                            </div>

                            {/* Nivel + Género */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    marginBottom: 8,
                                }}
                            >
                                <div>
                                    <TrophyOutlined style={{ marginRight: 6, color: "#1890ff" }} />
                                    <Text type="secondary">Nivel: {highlightMatch(classItem.level, searchTerm)}</Text>
                                </div>

                                {classItem.genre && (
                                    <div>
                                        <TeamOutlined style={{ marginRight: 6, color: "#722ed1" }} />
                                        <Text type="secondary">{highlightMatch(classItem.genre, searchTerm)}</Text>
                                    </div>
                                )}
                            </div>

                            {/* Día + Hora */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                }}
                            >
                                <div>
                                    <CalendarOutlined style={{ marginRight: 6, color: "#52c41a" }} />
                                    <Text type="secondary">{highlightMatch(classItem.date, searchTerm)}</Text>
                                </div>

                                <div>
                                    <ClockCircleOutlined style={{ marginRight: 6, color: "#fa8c16" }} />
                                    <Text type="secondary">{highlightMatch(classItem.hour, searchTerm)}</Text>
                                </div>
                            </div>
                        </Card>
                    </List.Item>
                );

            }}
        />
    );
};

export default AvailableClassesList;