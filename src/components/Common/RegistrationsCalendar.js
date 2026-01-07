import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Popconfirm, Typography, theme } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

// Helper to convert "Lunes, Miércoles" to day numbers for FullCalendar
const parseDaysToNumbers = (daysString) => {
    const dayMap = {
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6,
        "Sunday": 0,
    };

    if (!daysString) return [];

    return daysString
        .split(",")
        .map(day => day.trim())
        .map(day => dayMap[day])
        .filter(num => num !== undefined);
};

// Convert class to FullCalendar recurring event format
const classToEvent = (classItem, onRemove) => {
    const daysOfWeek = parseDaysToNumbers(classItem.class_date);

    const hourString = classItem.class_hour || classItem.hour;
    const [hours, minutes] = hourString.split(":").map(Number);

    const startTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
    const endTime = `${String(hours + 1).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

    const className = classItem.class_name || classItem.name;
    const classLevel = classItem.class_level || classItem.level;
    const classGenre = classItem.class_genre || classItem.genre;

    return {
        id: classItem.id?.toString(),
        title: className,
        daysOfWeek,
        startTime,
        endTime,
        backgroundColor: getColorByLevel(classLevel),
        borderColor: getColorByLevel(classLevel),
        extendedProps: {
            level: classLevel,
            genre: classGenre,
            classItem,
            onRemove,
        },
    };
};

// Color coding by level
const getColorByLevel = (level) => {
    const colors = {
        "Basico": "#fa8c16",
        "Intermedio": "#1890ff",
        "Avanzado": "#722ed1"
    };
    return colors[level] || "#1890ff";
};

const RegistrationsCalendar = ({ enrolledClasses, onRemoveClass }) => {
    const { token } = theme.useToken();

    const events = useMemo(() => {
        return enrolledClasses.map(classItem =>
            classToEvent(classItem, onRemoveClass)
        );
    }, [enrolledClasses, onRemoveClass]);

    const renderEventContent = (eventInfo) => {
        const { classItem, onRemove } = eventInfo.event.extendedProps;

        return (
            <div
                style={{
                    padding: "2px 6px",
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                        <Text strong style={{ color: "white", fontSize: 12, display: "block", lineHeight: "1.2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {eventInfo.event.title}
                        </Text>
                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>
                            {eventInfo.event.extendedProps.level}
                        </Text>
                    </div>

                    <Popconfirm
                        title="¿Dar de baja esta clase?"
                        onConfirm={(e) => {
                            e.stopPropagation();
                            onRemove(classItem);
                        }}
                        okText="Sí"
                        cancelText="No"
                    >
                        <DeleteOutlined
                            style={{
                                color: "white",
                                cursor: "pointer",
                                fontSize: 14,
                                marginLeft: 8,
                                marginTop: 2,
                                flexShrink: 0
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Popconfirm>
                </div>
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: token.colorBgContainer, padding: 16, borderRadius: 8 }}>
            <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: "",
                    center: "title",
                    right: "",
                }}
                allDaySlot={false}
                slotMinTime="08:00:00"
                slotMaxTime="22:00:00"
                slotDuration="01:00:00"
                height="auto"
                locale="es"
                hiddenDays={[0]}
                events={events}
                eventContent={renderEventContent}
                dayHeaderFormat={{ weekday: "short" }}

                slotLabelFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    meridiem: "short",
                }}

                slotLabelContent={(arg) => {
                    const date = arg.date;
                    let hours = date.getHours();
                    const minutes = date.getMinutes().toString().padStart(2, "0");
                    const ampm = hours >= 12 ? "pm" : "am";
                    hours = hours % 12;
                    if (hours === 0) hours = 12;
                    return (
                        <span style={{ color: token.colorText }}>
                            {`${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`}
                        </span>
                    );
                }}
            />
            {/* Inject minimal CSS overrides for calendar text color in dark mode */}
            <style>
                {`
                .fc-col-header-cell-cushion, 
                .fc-timegrid-slot-label-cushion {
                    color: ${token.colorText} !important;
                }
                .fc-theme-standard td, .fc-theme-standard th {
                    border-color: ${token.colorBorderSecondary} !important;
                }
                /* Header background to match theme */
                .fc-scrollgrid-section-header > td {
                    background-color: ${token.colorBgContainer} !important;
                }
                /* Navigation icons (arrows) */
                .fc-icon {
                    color: ${token.colorText} !important;
                }
                /* Toolbar title */
                .fc-toolbar-title {
                    color: ${token.colorText} !important;
                }
                /* More link for overflow events */
                .fc-more-link {
                    color: ${token.colorPrimary} !important;
                }
                /* Popover for overflow events */
                .fc-popover {
                    background-color: ${token.colorBgElevated} !important;
                    border-color: ${token.colorBorder} !important;
                }
                .fc-popover-header {
                    background-color: ${token.colorBgElevated} !important;
                    color: ${token.colorText} !important;
                }
                .fc-popover-body {
                    background-color: ${token.colorBgElevated} !important;
                }
                .fc-timegrid-event-harness-inset .fc-timegrid-event, .fc-timegrid-event.fc-event-mirror, .fc-timegrid-more-link {
                    box-shadow: none !important;
                }
                .fc-direction-ltr .fc-timegrid-col-events {
                    margin: 0 !important;
                }
                .fc-timegrid-axis, .fc-scrollgrid-sync-inner {
                    background-color: ${token.colorBgElevated} !important;
                }
                .fc-theme-standard .fc-scrollgrid {
                    border-color: ${token.colorBorderSecondary} !important;
                }
                `}
            </style>

        </div>
    );
};

export default RegistrationsCalendar;
