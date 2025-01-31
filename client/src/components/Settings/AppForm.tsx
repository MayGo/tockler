import { FormControl, FormLabel } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import { Switch } from '@chakra-ui/react';

import {
    getOpenAtLogin,
    getIsAutoUpdateEnabled,
    saveOpenAtLogin,
    saveIsAutoUpdateEnabled,
    getIsLoggingEnabled,
    saveIsLoggingEnabled,
    getNativeThemeChange,
    saveNativeThemeChange,
    getUsePurpleTrayIcon,
    saveUsePurpleTrayIcon,
} from '../../services/settings.api';
import { CardBox } from '../CardBox';

export const AppForm = () => {
    const isNativeThemeEnabled = getNativeThemeChange();
    const openAtLogin = getOpenAtLogin();
    const isAutoUpdateEnabled = getIsAutoUpdateEnabled();
    const isLoggingEnabled = getIsLoggingEnabled();
    const usePurpleTrayIcon = getUsePurpleTrayIcon();

    const onChangeNativeThemeChange = (event) => {
        saveNativeThemeChange(event.target.checked);
    };
    const onChangeOpenAtLogin = (event) => {
        saveOpenAtLogin(event.target.checked);
    };

    const onChangeAutoUpdate = (event) => {
        saveIsAutoUpdateEnabled(event.target.checked);
    };
    const onChangeLogging = (event) => {
        saveIsLoggingEnabled(event.target.checked);
    };
    const onChangeUsePurpleTrayIcon = (event) => {
        saveUsePurpleTrayIcon(event.target.checked);
    };

    const appName = import.meta.env.VITE_NAME;
    const platform = (window as any).electronBridge.platform;

    const linuxPath = `~/.config/${appName}/logs/main.log`;
    const macOSPath = `~/Library/Logs/${appName}/main.log`;
    const windowsPath = `%USERPROFILE%\\AppData\\Roaming\${appName}\\logs\\main.log`;

    let logPath = linuxPath;

    const isMacOS = platform === 'darwin';
    if (platform === 'win32') {
        logPath = windowsPath;
    } else if (isMacOS) {
        logPath = macOSPath;
    }

    return (
        <CardBox title="App settings" divider w="50%">
            <FormControl display="flex" alignItems="center" py={2}>
                <FormLabel htmlFor="os-theme" mb="0" flex="1">
                    Use OS theme?
                </FormLabel>
                <Switch
                    id="os-theme"
                    defaultChecked={isNativeThemeEnabled}
                    onChange={onChangeNativeThemeChange}
                    size="lg"
                />
            </FormControl>
            <FormControl display="flex" alignItems="center" py={2}>
                <FormLabel htmlFor="run-login" mb="0" flex="1">
                    Run at login?
                </FormLabel>
                <Switch id="run-login" defaultChecked={openAtLogin} onChange={onChangeOpenAtLogin} size="lg" />
            </FormControl>
            <FormControl display="flex" alignItems="center" py={2}>
                <FormLabel htmlFor="auto-update" mb="0" flex="1">
                    Auto update?
                </FormLabel>
                <Switch id="auto-update" defaultChecked={isAutoUpdateEnabled} onChange={onChangeAutoUpdate} size="lg" />
            </FormControl>

            <FormControl display="flex" alignItems="center" py={2}>
                <FormLabel htmlFor="enable-purple-tray" mb="0" flex="1">
                    Use purple tray icon?
                </FormLabel>
                <Switch
                    id="enable-purple-tray"
                    defaultChecked={usePurpleTrayIcon}
                    onChange={onChangeUsePurpleTrayIcon}
                    size="lg"
                />
            </FormControl>

            <FormControl display="flex" alignItems="center" py={2}>
                <FormLabel htmlFor="enable-logging" mb="0" flex="1">
                    Enable logging? (Applies after restart)
                </FormLabel>
                <Switch id="enable-logging" defaultChecked={isLoggingEnabled} onChange={onChangeLogging} size="lg" />
            </FormControl>
            <Text fontSize="xs" color="gray.500" pt={2}>
                Log path: {logPath}
            </Text>
        </CardBox>
    );
};
