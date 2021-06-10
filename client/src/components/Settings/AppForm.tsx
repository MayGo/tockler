import React from 'react';
import { Card, Form, Input, Switch, Typography } from 'antd';
import {
    getOpenAtLogin,
    saveOpenAtLogin,
    getIsLoggingEnabled,
    saveIsLoggingEnabled,
    getStagingUserId,
    saveStagingUserId,
} from '../../services/settings.api';

const { Text } = Typography;

export const AppForm = () => {
    const openAtLogin = getOpenAtLogin();
    const isLoggingEnabled = getIsLoggingEnabled();
    const stagingUserId = getStagingUserId();

    const onChangeOpenAtLogin = value => {
        saveOpenAtLogin(value);
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
                <Switch defaultChecked={openAtLogin} onChange={onChangeOpenAtLogin} /> Run at login
            </Form.Item>
            <Form.Item>
                <Switch defaultChecked={isLoggingEnabled} onChange={onChangeLogging} /> {'  '}
                Enable logging (Applies after restart)
                <br />
                <Text type="secondary">Log path: {logPath}</Text>
            </Form.Item>
            <Form.Item>
                <Input
                    placeholder="Staging userId"
                    maxLength={25}
                    defaultValue={stagingUserId}
                    onChange={e => saveStagingUserId(e.target.value)}
                />
                <Text type="secondary">
                    Used to debug on app.gitstart.dev. For development purposes only.
                </Text>
            </Form.Item>
        </Card>
    );
};
