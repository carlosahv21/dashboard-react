import React from "react";
import { Select, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";

const StudentSelector = ({
    students,
    loading,
    selectedStudentId,
    onStudentSelect
}) => {
    return (
        <div style={{ marginBottom: 24 }}>
            <Select
                showSearch
                placeholder="Buscar y seleccionar estudiante..."
                style={{ width: "100%" }}
                value={selectedStudentId}
                onChange={onStudentSelect}
                loading={loading}
                notFoundContent={loading ? <Spin size="small" /> : "No se encontraron estudiantes"}
                filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={students.map(student => ({
                    value: student.id,
                    label: `${student.first_name} ${student.last_name} (${student.email})`,
                }))}
                suffixIcon={<UserOutlined />}
            />
        </div>
    );
};

export default StudentSelector;
