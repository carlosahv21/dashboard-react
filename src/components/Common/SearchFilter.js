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
}) => {
    const masiveActions = [
        {
            value: "export",
            label: "Exportar a Excel",
            onClick: () => onExport(),
            icon: <FileExcelOutlined />,
        },
        canDelete && {
            value: "delete",
            label: "Eliminar",
            onClick: () => onBulkDelete(),
            icon: <DeleteOutlined />,
            danger: true,
        },
    ];
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: 16,
            }}
        >
            <Title level={2} style={{ marginBottom: 0, marginTop: 0 }}>
                {titlePlural}
            </Title>

            <Space>
                <Space size={5}>
                    <Typography.Text type="secondary">Mostrar</Typography.Text>
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
                    placeholder={`Buscar ${title.toLowerCase()}`}
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
                        Acciones masivas <DownOutlined />
                    </Button>
                </Dropdown>

                {viewOptions && viewOptions.length > 1 && (
                    <>
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
                    </>
                )}

                {canCreate && (
                    <Button type="primary" onClick={onCreate} icon={<PlusOutlined />}>
                        Crear {title}
                    </Button>
                )}
            </Space>
        </div>
    );
};

export default SearchFilter;
