import { Card, Form, Switch, Typography } from 'antd';
import React from 'react';
import {
    getOpenAtLogin,
    getIsAutoUpdateEnabled,
    saveOpenAtLogin,
    saveIsAutoUpdateEnabled,
    getIsLoggingEnabled,
    saveIsLoggingEnabled,
} from '../../services/settings.api';

const { Text } = Typography;

export const AppForm = () => {
    const openAtLogin = getOpenAtLogin();
    const isAutoUpdateEnabled = getIsAutoUpdateEnabled();
    const isLoggingEnabled = getIsLoggingEnabled();
    const onChangeOpenAtLogin = value => {
        saveOpenAtLogin(value);
    };

    const onChangeAutoUpdate = value => {
        saveIsAutoUpdateEnabled(value);
    };
    const onChangeLogging = value => {
        saveIsLoggingEnabled(value);
    };

    const appName = process.env.REACT_APP_NAME;
    const platform = (window as any).platform;

    const linuxPath = `~/.config/${appName}/logs/main.log`;
    const macOSPath = `~/Library/Logs/${appName}/main.log`;
    const windowsPath = `%USERPROFILE%\\AppData\\Roaming\${appName}\\logs\\main.log`;

    let logPath = linuxPath;
    if (platform === 'win32') {
        logPath = windowsPath;
    } else if (platform === 'darwin') {
        logPath = macOSPath;
    }

    return (
        <Card title="App settings">
            <Form.Item>
                <Switch defaultChecked={openAtLogin} onChange={onChangeOpenAtLogin} />
                {'  '} Run at login
            </Form.Item>
            <Form.Item>
                <Switch defaultChecked={isAutoUpdateEnabled} onChange={onChangeAutoUpdate} /> {'  '}
                Auto update
            </Form.Item>
            <Form.Item>
                <Switch defaultChecked={isLoggingEnabled} onChange={onChangeLogging} /> {'  '}
                Enable logging (Applies after restart)
                <br />
                <Text type="secondary">Log path: {logPath}</Text>
            </Form.Item>
            <Form.Item></Form.Item>
        </Card>
    );
};
