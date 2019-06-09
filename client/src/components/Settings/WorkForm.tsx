import { Card, Icon, Input } from 'antd';
import * as React from 'react';
import { useFormState } from 'react-use-form-state';
import { RootContext } from '../../RootContext';

export const WorkForm = () => {
    const { workSettings, setWorkSettings } = React.useContext(RootContext);
    // tslint:disable-next-line: variable-name
    const [_, { number }] = useFormState(workSettings, {
        onChange: (_, __, nextStateValues) => {
            setWorkSettings(nextStateValues);
        },
    });

    return (
        <Card title="Work settings">
            <Input
                placeholder="Workday length"
                prefix={<Icon type="clock-circle-o" />}
                maxLength={25}
                {...number({ name: 'hoursToWork' })}
            />
        </Card>
    );
};
