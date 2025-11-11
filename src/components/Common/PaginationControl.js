import React from "react";
import { Pagination } from "antd";

const PaginationControl = ({ page, total, onChange, pageSize = 10 }) => {
    return (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
            <Pagination
                current={page}
                total={total}
                pageSize={pageSize}
                onChange={onChange}
                showSizeChanger={false}
            />
        </div>
    );
};

export default PaginationControl;
