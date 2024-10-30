import React from "react";
import { Select } from "antd";

const { Option } = Select;

const SelectInput = ({ name, rules, options, defaultValue }) => (
    <Select defaultValue={defaultValue} name={name} rules={rules}>
        {options.map((option) => (
            <Option key={option.value} value={option.value}>
                {option.label}
            </Option>
        ))}
    </Select>
);

export default SelectInput;
