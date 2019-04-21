import * as React from 'react';
import { Icon, Card, Input } from 'antd';
import { SettingsService } from '../../services/SettingsService';
import { useFormState } from 'react-use-form-state';
import { RootContext } from '../../RootContext';
const data = {};
export const WorkForm = () => {
    const { workSettings, setWorkSettings } = React.useContext(RootContext);
    const [formState, { number }] = useFormState(workSettings, {
        onChange: (e, stateValues, nextStateValues) => {
            console.error('nextStateValues', nextStateValues);
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
