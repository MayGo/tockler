import { Card, Form, Switch } from 'antd';
import React from 'react';
import {
    getOpenAtLogin,
    getIsAutoUpdateEnabled,
    saveOpenAtLogin,
    saveIsAutoUpdateEnabled,
} from '../../services/settings.api';

export const AppForm = () => {
    const openAtLogin = getOpenAtLogin();
    const isAutoUpdateEnabled = getIsAutoUpdateEnabled();
    const onChangeOpenAtLogin = value => {
        saveOpenAtLogin(value);
    };

    const onChangeAutoUpdate = value => {
        saveIsAutoUpdateEnabled(value);
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
