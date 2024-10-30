import React from "react";
import { Input } from "antd";

const TextInput = ({ name, rules, value }) => (
    <Input name={name} defaultValue={value} rules={rules} />
);

export default TextInput;
