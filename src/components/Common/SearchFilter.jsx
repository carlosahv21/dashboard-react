// components/SearchFilter.jsx (Con Alineación Vertical y Botón de Exportar)
import React from "react";
import { Input, Button, Space, Select, Typography, Dropdown } from "antd";
import {
    SearchOutlined,
    PlusOutlined,
    FileExcelOutlined,
    DeleteOutlined,
    DownOutlined,
    AppstoreOutlined,
    TableOutlined,
} from "@ant-design/icons";
import * as Icons from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

const SearchFilter = ({
    search,
    setSearch,
    onCreate,
    canDelete,
    title,
    titlePlural,
    canCreate,
    pageSize,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 20, 50, 100],
    onExport,
    onBulkDelete,
    viewOptions,
    currentView,
    onViewChange,
    extraActions,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const masiveActions = [
        {
            key: "export",
            label: t('global.exportExcel'),
            onClick: () => onExport && onExport(),
            icon: <FileExcelOutlined />,
        },
        canDelete && {
            key: "delete",
            label: t('global.delete'),
            onClick: () => onBulkDelete && onBulkDelete(),
            icon: <DeleteOutlined />,
            danger: true,
        },
    ].filter(Boolean); // Filtrar falsy values

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: "16px"
            }}
        >
            <Title level={2} style={{ marginBottom: 0, marginTop: 0 }}>
                {titlePlural}
            </Title>

            <Space wrap>
                <Space size={5}>
                    <Typography.Text type="secondary">{t('global.show')}</Typography.Text>
                    <Select
                        value={pageSize}
                        style={{ width: 70 }}
                        onChange={onPageSizeChange}
                        options={pageSizeOptions.map((size) => ({
                            value: size,
                            label: String(size),
                        }))}
                    />
                </Space>

                <Input
                    placeholder={t('global.searchPlaceholder', { title: title.toLowerCase() })}
                    allowClear
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 250 }}
                    suffix={<SearchOutlined />}
                />

                <Dropdown
                    menu={{ items: masiveActions }}
                    placement="bottomRight"
                    trigger={["click"]}
                >
                    <Button>
                        {t('global.massiveActions')} <DownOutlined />
                    </Button>
                </Dropdown>

                {viewOptions && viewOptions.length > 1 && (
                    <Space>
                        {viewOptions.includes("table") && (
                            <Button
                                type={currentView === "table" ? "primary" : "default"}
                                icon={<TableOutlined />}
                                onClick={() => onViewChange("table")}
                            />
                        )}
                        {viewOptions.includes("card") && (
                            <Button
                                type={currentView === "card" ? "primary" : "default"}
                                icon={<AppstoreOutlined />}
                                onClick={() => onViewChange("card")}
                            />
                        )}
                    </Space>
                )}

                {canCreate && (
                    <Button type="primary" onClick={onCreate} icon={<PlusOutlined />}>
                        {t('global.createTitle', { title: title })}
                    </Button>
                )}

                {extraActions && extraActions.map((action, index) => {
                    const IconComponent = action.icon && Icons[action.icon + "Outlined"] 
                        ? Icons[action.icon + "Outlined"] 
                        : (action.icon && Icons[action.icon] ? Icons[action.icon] : null);
                    
                    return (
                        <Button 
                            key={index}
                            type={action.type || "default"}
                            onClick={() => action.path ? navigate(action.path) : (action.onClick && action.onClick())}
                            icon={IconComponent ? <IconComponent /> : null}
                        >
                            {action.label}
                        </Button>
                    );
                })}
            </Space>
        </div>
    );
};

export default SearchFilter;
