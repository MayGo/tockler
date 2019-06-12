import { Card, Form, Switch } from 'antd';
import * as React from 'react';
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
            <Form.Item>
                <Switch defaultChecked={openAtLogin} onChange={onChangeOpenAtLogin} />
                {'  '} Run at login
            </Form.Item>
            <Form.Item>
                <Switch defaultChecked={isAutoUpdateEnabled} onChange={onChangeAutoUpdate} /> {'  '}
                Auto update
            </Form.Item>
        </Card>
    );
};
