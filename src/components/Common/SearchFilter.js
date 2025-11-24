import React from "react";
import { Input, Button, Space } from "antd";
const { Search } = Input;

const SearchFilter = ({ search, setSearch, onCreate, title, canCreate }) => {
    return (
        <Space style={{ marginBottom: 16, display: "flex", justifyContent: "end" }}>
            <Search
                placeholder={`Buscar ${title.toLowerCase()}`}
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 200 }}
            />
            {canCreate && (
                <Button type="primary" onClick={onCreate}>
                    Crear {title}
                </Button>
            )}
        </Space>
    );
};

export default SearchFilter;
