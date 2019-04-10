import * as React from 'react';
import { Field } from 'redux-form';
import { TextField } from 'redux-form-antd';

import { Icon, Card } from 'antd';
import { labelCol, wrapperCol } from './SettingsForm.styles';

interface IProps {}
interface IState {}

export class WorkForm extends React.PureComponent<IProps, IState> {
    render() {
        return (
            <Card title="Work settings">
                <Field
                    name="work.hoursToWork"
                    type="number"
                    label="Workday length"
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
                    component={TextField}
                    prefix={<Icon type="clock-circle-o" />}
                />
            </Card>
        );
    }
}
