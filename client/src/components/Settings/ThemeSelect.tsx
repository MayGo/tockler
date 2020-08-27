import { Select } from 'antd';
import React from 'react';
import { Box, Flex } from 'reflexbox';
import { useTheme } from '../../routes/AntdThemeProvider';
import { ThemeVariables } from '../../constants';
import { ColorPicker } from '../Timeline/ColorPicker';

export const ThemeSelect = () => {
    const [{ name, variables, themes }, setTheme]: any = useTheme();

    return (
        <Flex pl={24} pt={10} pb={2}>
            <Box alignSelf="center">
                <h4>Selected Theme</h4>
            </Box>
            <Box pl={10}>
                <Select
                    style={{ width: 100 }}
                    value={name}
                    onChange={theme => {
                        setTheme(ThemeVariables[theme]);
                    }}
                >
                    {themes.map(({ name }) => (
                        <Select.Option key={name} value={name}>
                            {name}
                        </Select.Option>
                    ))}
                </Select>
            </Box>
            <Box pl={10}>
                <ColorPicker
                    color={variables['primary-color']}
                    onChange={color => {
                        setTheme({
                            ...ThemeVariables[name],
                            variables: {
                                ...ThemeVariables[name].variables,
                                'primary-color': color,
                            },
                        });
                    }}
                />
            </Box>
        </Flex>
    );
};
