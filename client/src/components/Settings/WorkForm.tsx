import { Card, Input, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import React, { useContext } from 'react';
import { useFormState } from 'react-use-form-state';
import { RootContext } from '../../RootContext';

const { Text } = Typography;

export const WorkForm = () => {
    const { workSettings, setWorkSettings } = useContext(RootContext);
    // tslint:disable-next-line: variable-name
    const [, { number }] = useFormState(workSettings, {
        onChange: (__ignore, ___ignore, nextStateValues) => {
            setWorkSettings(nextStateValues);
        },
    });

    return (
        <Card title="Work settings">
            <Input
                placeholder="Workday length"
                prefix={<ClockCircleOutlined />}
                maxLength={25}
                {...number({ name: 'hoursToWork' })}
            />

            <Text type="secondary"> Used in Progress pie chart to calculate workday progress</Text>
        </Card>
    );
};
