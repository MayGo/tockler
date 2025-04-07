import { FormControl, FormLabel, Switch, Text } from '@chakra-ui/react';
import { ChangeEvent } from 'react';

import {
    getIsAutoUpdateEnabled,
    getIsLoggingEnabled,
    getMacAutoHideMenuBarEnabled,
    getNativeThemeChange,
    getOpenAtLogin,
    getUsePurpleTrayIcon,
    saveIsAutoUpdateEnabled,
    saveIsLoggingEnabled,
    saveMacAutoHideMenuBarEnabled,
    saveNativeThemeChange,
    saveOpenAtLogin,
    saveUsePurpleTrayIcon,
} from '../../services/settings.api';
import '../../types/electron-bridge';
import { CardBox } from '../CardBox';

export const AppForm = () => {
    const isNativeThemeEnabled = getNativeThemeChange();
    const openAtLogin = getOpenAtLogin();
    const isAutoUpdateEnabled = getIsAutoUpdateEnabled();
    const isLoggingEnabled = getIsLoggingEnabled();
    const usePurpleTrayIcon = getUsePurpleTrayIcon();
    const macAutoHideMenuBarEnabled = getMacAutoHideMenuBarEnabled();
    const onChangeNativeThemeChange = (event: ChangeEvent<HTMLInputElement>) => {
        saveNativeThemeChange(event.target.checked);
    };
    const onChangeOpenAtLogin = (event: ChangeEvent<HTMLInputElement>) => {
        saveOpenAtLogin(event.target.checked);
    };

    const onChangeAutoUpdate = (event: ChangeEvent<HTMLInputElement>) => {
        saveIsAutoUpdateEnabled(event.target.checked);
    };
    const onChangeLogging = (event: ChangeEvent<HTMLInputElement>) => {
        saveIsLoggingEnabled(event.target.checked);
    };
    const onChangeUsePurpleTrayIcon = (event: ChangeEvent<HTMLInputElement>) => {
        saveUsePurpleTrayIcon(event.target.checked);
    };
    const onChangeMacAutoHideMenuBarEnabled = (event: ChangeEvent<HTMLInputElement>) => {
        saveMacAutoHideMenuBarEnabled(event.target.checked);
    };

    const appName = import.meta.env.VITE_NAME;
    const platform = window.electronBridge.platform;

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
            <Text fontSize="xs" color="gray.500" pt={1}>
                Log path: {logPath}
            </Text>
            {window.electronBridge.platform === 'darwin' && (
                <>
                    <FormControl display="flex" alignItems="center" py={2}>
                        <FormLabel htmlFor="macAutoHideMenuBarEnabled" mb="0" flex="1">
                            Enable tray positioning for auto-hide menu bar
                        </FormLabel>
                        <Switch
                            id="macAutoHideMenuBarEnabled"
                            defaultChecked={macAutoHideMenuBarEnabled}
                            onChange={onChangeMacAutoHideMenuBarEnabled}
                            size="lg"
                        />
                    </FormControl>
                    <Text fontSize="xs" color="gray.500" pt={1}>
                        Enable this if you use "Automatically hide and show the menu bar" in macOS settings
                    </Text>
                </>
            )}
        </CardBox>
    );
};
