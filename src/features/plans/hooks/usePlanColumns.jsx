import { useTranslation } from "react-i18next";
import { Tag, Typography, Space, Badge } from "antd";
import { ClockCircleOutlined, ThunderboltOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const usePlanColumns = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t("global.name"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      defaultSortOrder: "ascend",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: t("plans.price", { defaultValue: "Precio" }),
      dataIndex: "price",
      key: "price",
      sorter: true,
      render: (price) => {
        const formatted = new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'USD',
        }).format(price || 0);
        return (
          <Tag color="green" style={{ fontSize: '13px', padding: '2px 8px', borderRadius: '4px' }}>
            {formatted}
          </Tag>
        );
      },
    },
    {
      title: t("students.type", { defaultValue: "Tipo" }),
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let text = type;
        let color = "default";

        switch (type) {
          case 'monthly':
            text = t("plans.monthly_billed", { defaultValue: "Mensual" });
            color = "purple";
            break;
          case 'package':
            text = t("plans.type_package", { defaultValue: "Paquete" });
            color = "cyan";
            break;
          case 'subscription':
            text = t("plans.type_subscription", { defaultValue: "Suscripción" });
            color = "geekblue";
            break;
          default:
            text = type ? type.toUpperCase() : "-";
        }
        return <Tag color={color}>{text}</Tag>;
      },
      sorter: true,
    },
    {
      title: t("plans.configuration", { defaultValue: "Configuración" }),
      key: "configuration",
      render: (_, record) => {
        const countClasses = record.max_classes;
        const countSessions = record.max_sessions;

        return (
          <Space direction="vertical" size={2}>
            {countClasses > 0 && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <ThunderboltOutlined style={{ marginRight: 4 }} />
                {countClasses} {t("plans.max_classes", { defaultValue: "clases" }).toLowerCase()}
              </Text>
            )}
            {countSessions > 0 && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {countSessions} {t("plans.max_sessions", { defaultValue: "sesiones" }).toLowerCase()}
              </Text>
            )}
            {record.trial_period_days > 0 && (
              <Tag color="gold" style={{ marginTop: 4 }}>
                {record.trial_period_days} {t("global.days", { defaultValue: "días" })} {t("plans.trial_period", { defaultValue: "de prueba" }).toLowerCase()}
              </Tag>
            )}
            {!countClasses && !countSessions && !record.trial_period_days && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t("global.noLimit", { defaultValue: "Sin límite" })}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: t("global.status", { defaultValue: "Estado" }),
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const isActive = status === 'active' || record.active === true;
        return (
          <Badge
            status={isActive ? "success" : "error"}
            text={
              <Text type={isActive ? "success" : "danger"} strong style={{ fontSize: '13px' }}>
                {isActive ? t("global.active", { defaultValue: "Activo" }) : t("global.inactive", { defaultValue: "Inactivo" })}
              </Text>
            }
          />
        );
      },
      sorter: true,
    },
  ];

  return columns;
};
