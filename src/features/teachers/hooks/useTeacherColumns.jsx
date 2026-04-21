import { useTranslation } from "react-i18next";
import { Tag, Typography, Space, Avatar, Tooltip } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const useTeacherColumns = () => {
    const { t } = useTranslation();

    const columns = [
        {
            title: t("global.name", { defaultValue: "Profesor" }),
            dataIndex: "first_name",
            key: "full_name",
            sorter: true,
            defaultSortOrder: "ascend",
            render: (firstName, record) => {
                const initials = `${firstName?.charAt(0) || ''}${record.last_name?.charAt(0) || ''}`.toUpperCase();
                return (
                    <Space size="middle">
                        <Avatar
                            src={record.avatar}
                            icon={!record.avatar && !initials ? <UserOutlined /> : null}
                            style={{ backgroundColor: '#722ed1', verticalAlign: 'middle' }}
                        >
                            {!record.avatar && initials}
                        </Avatar>
                        <Space direction="vertical" size={0}>
                            <Text strong style={{ fontSize: '14px' }}>
                                {firstName} {record.last_name || ''}
                            </Text>
                            <Space size={4}>
                                <MailOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
                            </Space>
                        </Space>
                    </Space>
                );
            }
        },
        {
            title: t('global.phone', { defaultValue: 'Teléfono' }),
            dataIndex: "phone",
            key: "phone",
            sorter: true,
            render: (phone) => (
                phone ? (
                    <Space size={4}>
                        <PhoneOutlined style={{ color: '#8c8c8c' }} />
                        <Text>{phone}</Text>
                    </Space>
                ) : <Text type="secondary">-</Text>
            )
        },
        {
            title: t("global.role", { defaultValue: "Rol" }),
            dataIndex: "role_name",
            key: "role_name",
            sorter: true,
            render: (role, record) => {
                const roleFormatted = role ? role.charAt(0).toUpperCase() + role.slice(1) : t('global.no_role', { defaultValue: 'Sin rol' });
                return (
                    <Space>
                        <Tag color="purple">{roleFormatted}</Tag>
                        {record.email_verified && (
                            <Tooltip title={t('global.verified', { defaultValue: 'Verificado' })}>
                                <SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                            </Tooltip>
                        )}
                    </Space>
                );
            }
        },
    ];

    return columns;
};
