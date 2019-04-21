import * as React from 'react';
import { Card, Switch } from 'antd';
import { SettingsService } from '../../services/SettingsService';

const openAtLogin = SettingsService.getOpenAtLogin();
const isAutoUpdateEnabled = SettingsService.getIsAutoUpdateEnabled();

export const AppForm = () => {
    const onChangeOpenAtLogin = value => {
        SettingsService.saveOpenAtLogin(value);
    };

    const onChangeAutoUpdate = value => {
        SettingsService.saveOpenAtLogin(value);
    };
    return (
        <Card title="App settings">
            Run at login
            <Switch defaultChecked={openAtLogin} onChange={onChangeOpenAtLogin} />
            Auto update
            <Switch defaultChecked={isAutoUpdateEnabled} onChange={onChangeAutoUpdate} />,
        </Card>
    );
};
