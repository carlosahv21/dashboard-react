import React from "react";
import { Select, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";

const highlightMatch = (text, query) => {
    if (!query || query.length < 3) {
        return text;
    }

    const parts = [];
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let lastIndex = 0;

    for (let i = 0; i <= lowerText.length - lowerQuery.length; i++) {
        if (lowerText.substring(i, i + lowerQuery.length) === lowerQuery) {
            if (i > lastIndex) {
                parts.push(<span key={`pre-${lastIndex}`}>{text.substring(lastIndex, i)}</span>);
            }
            parts.push(<strong key={`match-${i}`}>{text.substring(i, i + lowerQuery.length)}</strong>);
            lastIndex = i + lowerQuery.length;
            i += lowerQuery.length - 1;
        }
    }

    if (lastIndex < text.length) {
        parts.push(<span key={`post-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }

    return <span>{parts}</span>;
};


const StudentSelector = ({
    students,
    loading,
    selectedStudentId,
    onStudentSelect,
    onStudentSearch,
    searchTerm
}) => {
    let notFoundText = "No se encontraron estudiantes";

    if (students === null || (Array.isArray(students) && students.length === 0)) {
        notFoundText = "Escriba al menos 3 caracteres para buscar estudiantes...";
    }

    const options = Array.isArray(students) ? students.map(student => {
        const fullLabel = `${student.first_name} ${student.last_name} (${student.email})`;

        return {
            value: student.id,
            label: highlightMatch(fullLabel, searchTerm),
        };
    }) : [];

    return (
        <div style={{ marginBottom: 24 }}>
            <Select
                showSearch
                placeholder="Escriba para buscar estudiantes..."
                style={{ width: "100%" }}
                value={selectedStudentId}
                onChange={onStudentSelect}
                onSearch={onStudentSearch}
                loading={loading}
                filterOption={false}
                notFoundContent={loading ? <Spin size="small" /> : notFoundText}

                options={options}
                suffixIcon={<UserOutlined />}
            />
        </div>
    );
};

export default StudentSelector;