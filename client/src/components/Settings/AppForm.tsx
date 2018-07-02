import * as React from 'react';
import { Field } from 'redux-form';
import { SwitchField } from 'redux-form-antd';
import { Card, Switch } from 'antd';
import { labelCol, wrapperCol } from './SettingsForm.styles';

console.debug(
    'Switch has to be imported, redux-form-antd Switch does not work without it.',
    Switch,
);

interface IProps {}
interface IState {}

export class AppForm extends React.Component<IProps, IState> {
    render() {
        return (
            <Card title="App settings">
                <Field
                    name="app.openAtLogin"
                    type="text"
                    label="Run at login"
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
                    size="default"
                    component={SwitchField}
                />

                <Field
                    name="app.isAutoUpdateEnabled"
                    type="text"
                    label="Auto update"
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
                    size="default"
                    component={SwitchField}
                />
            </Card>
        );
    }
}
