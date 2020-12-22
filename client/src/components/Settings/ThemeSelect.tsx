import { Select } from 'antd';
import React from 'react';
import { Box, Flex } from 'reflexbox';
import { ColorPicker } from '../Timeline/ColorPicker';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { PRIMARY_COLOR_VAR, themes } from '../../store/theme.util';

export const ThemeSelect = () => {
    const theme: any = useStoreState(state => state.theme);
    const setThemeByName = useStoreActions(actions => actions.setThemeByName);
    const setThemeWithVariables = useStoreActions(actions => actions.setThemeWithVariables);

    return (
        <Flex pl={24} pt={10} pb={2}>
            <Box alignSelf="center">
                <h4>Selected Theme</h4>
            </Box>
            <Box pl={10}>
                <Select
                    style={{ width: 100 }}
                    value={theme.name}
                    onChange={theme => {
                        setThemeByName(theme);
                    }}
                >
                    {Object.keys(themes).map(name => (
                        <Select.Option key={name} value={name}>
                            {name}
                        </Select.Option>
                    ))}
                </Select>
            </Box>
            <Box pl={10}>
                <ColorPicker
                    color={theme.variables[PRIMARY_COLOR_VAR]}
                    onChange={color => {
                        setThemeWithVariables({
                            ...theme,
                            variables: {
                                ...theme.variables,
                                [PRIMARY_COLOR_VAR]: color,
                            },
                        });
                    }}
                />
            </Box>
        </Flex>
    );
};
