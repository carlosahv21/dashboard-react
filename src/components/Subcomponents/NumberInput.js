import React from "react";
import { Input } from "antd";

const NumberInput = ({ name, rules, defaultValue }) => (
    <Input name={name} type="number" rules={rules} defaultValue={defaultValue} />
);

export default NumberInput;
