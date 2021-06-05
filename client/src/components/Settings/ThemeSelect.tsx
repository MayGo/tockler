import React from 'react';
import { ColorPicker } from '../Timeline/ColorPicker';
import { useStoreActions, useStoreState } from '../../store/easyPeasy';
import { PRIMARY_COLOR_VAR, themes } from '../../store/theme.util';
import { Select } from '@chakra-ui/select';
import { Flex, Box } from '@chakra-ui/layout';

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
                    onChange={event => {
                        console.info('Selected theme', event.target.value);
                        setThemeByName(event.target.value);
                    }}
                >
                    {Object.keys(themes).map(name => (
                        <option value={name}>{name}</option>
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
