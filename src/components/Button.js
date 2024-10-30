import React from "react";
import { Button } from "antd";

const ButtonComponent = ({ children, type, onClick, disabled, loading }) => {
    return (
        <Button type={type} onClick={onClick} disabled={disabled} loading={loading}>
            {children}
        </Button>
    );
};

export default ButtonComponent;