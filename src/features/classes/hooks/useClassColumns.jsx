import { useTranslation } from "react-i18next";
import { Tag, Typography, Space } from "antd";
import { ClockCircleOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

const getLevelColor = (level) => {
  if (!level) return "default";
  const lowered = level.toLowerCase();
  if (lowered.includes("basic") || lowered.includes("principiante")) return "green";
  if (lowered.includes("inter") || lowered.includes("medio")) return "orange";
  if (lowered.includes("adv") || lowered.includes("avanzado")) return "red";
  return "cyan";
};

export const useClassColumns = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t("classes.name", { defaultValue: "Nombre" }),
      dataIndex: "name",
      key: "name",
      sorter: true,
      defaultSortOrder: "ascend",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: '14px' }}>{text}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    { 
      title: t("classes.level", { defaultValue: "Nivel" }), 
      dataIndex: "level", 
      key: "level", 
      sorter: true,
      render: (level) => (
        <Tag color={getLevelColor(level)}>{level || "-"}</Tag>
      )
    },
    { 
      title: t("classes.genre", { defaultValue: "Género" }), 
      dataIndex: "genre", 
      key: "genre", 
      sorter: true,
      render: (genre) => (
        <Tag color="purple">{genre || "-"}</Tag>
      )
    },
    { 
      title: t("classes.date", { defaultValue: "Día" }), 
      dataIndex: "date", 
      key: "date", 
      sorter: true,
      render: (date) => (
        <Space size={4}>
          <CalendarOutlined style={{ color: '#8c8c8c' }} />
          <Text>{date ? t(`days.${date}`, { defaultValue: date }) : "-"}</Text>
        </Space>
      )
    },
    { 
      title: t("classes.hour", { defaultValue: "Hora" }), 
      dataIndex: "hour", 
      key: "hour", 
      sorter: true,
      render: (hour, record) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
          <Text>{hour || "-"}</Text>
          {record.duration && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ({record.duration} min)
            </Text>
          )}
        </Space>
      )
    },
    {
      title: t("global.capacity", { defaultValue: "Capacidad" }),
      dataIndex: "capacity",
      key: "capacity",
      sorter: true,
      render: (capacity) => {
        if (!capacity && capacity !== 0) return "-";
        return (
          <Space size={4}>
            <UserOutlined style={{ color: '#8c8c8c' }} />
            <Text>{capacity}</Text>
          </Space>
        );
      }
    }
  ];

  return columns;
};
