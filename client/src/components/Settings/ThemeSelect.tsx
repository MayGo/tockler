import { Select } from 'antd';
import React from 'react';
import { useTheme } from 'antd-theme';

import { SketchPicker } from 'react-color';

export const ThemeSelect = () => {
    const [{ name, variables, themes }, setTheme]: any = useTheme();

    return (
        <>
            <Select
                style={{ width: 100 }}
                value={name}
                onChange={theme => setTheme({ name: theme, variables })}
            >
                {themes.map(({ name }) => (
                    <Select.Option key={name} value={name}>
                        {name}
                    </Select.Option>
                ))}
            </Select>
            <SketchPicker
                color={variables['primary-color']}
                onChange={value => {
                    // Will update all css attributes affected by primary-color
                    setTheme({ name, variables: { 'primary-color': value.hex } });
                }}
            />
        </>
    );
};
