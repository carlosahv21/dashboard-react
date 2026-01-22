import React from "react";
import { Card, Avatar, App } from "antd";
import {
    EditOutlined,
    EyeOutlined,
    DeleteOutlined,
    UserOutlined,
    HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Meta } = Card;

const StudentCard = ({
    record,
    onEdit,
    onDelete,
    onRowClick,
    canEdit,
    canDelete,
}) => {
    const { t } = useTranslation();
    const { modal } = App.useApp();
    const navigate = useNavigate();

    const handleDeleteConfirm = (id) => {
        modal.confirm({
            title: t('global.deleteTitle'),
            content: t('global.deleteConfirm'),
            okText: t('global.yes'),
            okType: "danger",
            cancelText: t('global.cancel'),
            onOk: () => onDelete && onDelete(id),
        });
    };

    return (
        <Card
            title={`${record.first_name} ${record.last_name}`}
            extra={
                <EyeOutlined
                    key="view"
                    style={{ color: "#1668dc" }}
                    onClick={() => onRowClick(record)}
                />
            }
            actions={[
                <HistoryOutlined
                    key="history"
                    style={{ color: "#696969" }}
                    onClick={() => navigate(`/students/${record.id}/history`)}
                />,
                canEdit && (
                    <EditOutlined
                        key="edit"
                        style={{ color: "#13a8a8" }}
                        onClick={() => onEdit(record.id)}
                    />
                ),
                canDelete && (
                    <DeleteOutlined
                        key="delete"
                        style={{ color: "#d32029" }}
                        onClick={() => handleDeleteConfirm(record.id)}
                    />
                ),
            ].filter(Boolean)}
        >
            <Meta
                avatar={
                    <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        src={
                            record.gender === "female"
                                ? "/avatar_female.png"
                                : "/avatar_male.png"
                        }
                    />
                }
                description={
                    <div>
                        <div>{record.email}</div>
                        <div style={{ marginTop: 5, fontStyle: "italic" }}>
                            {record.role_name
                                ? record.role_name.charAt(0).toUpperCase() +
                                record.role_name.slice(1)
                                : ""}
                        </div>
                    </div>
                }
            />
        </Card>
    );
};

export default StudentCard;
