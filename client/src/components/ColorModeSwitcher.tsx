import { useColorMode, useColorModeValue, IconButton, IconButtonProps, Tooltip } from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { saveThemeToStorage } from '../services/settings.api';
import { THEMES } from '../store/theme.util';

type ColorModeSwitcherProps = Omit<IconButtonProps, 'aria-label'>;

export const ColorModeSwitcher = (props: ColorModeSwitcherProps) => {
    const { colorMode, setColorMode } = useColorMode();
    const text = useColorModeValue('dark', 'light');

    const SwitchIcon = useColorModeValue(FaMoon, FaSun);

    const setColorModeAndSave = () => {
        const theme = colorMode === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        setColorMode(theme);
        saveThemeToStorage(theme);
    };

    // TODO: Add Auto mode to toggle also

    const label = `Switch to ${text} mode`;

    return (
        <Tooltip label={label}>
            <IconButton
                size="md"
                fontSize="lg"
                variant="ghost"
                color="current"
                marginLeft="2"
                onClick={setColorModeAndSave}
                icon={<SwitchIcon />}
                aria-label={label}
                {...props}
            />
        </Tooltip>
    );
};
