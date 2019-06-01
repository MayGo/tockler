import * as React from 'react';

import { Flex, Box } from 'grid-styled';
import { Form, Switch, Button, Divider, Input, Icon } from 'antd';
import { labelCol, wrapperCol } from './SettingsForm.styles';
import { testAnalyserItem } from './AnalyserForm.util';
import { useFormState } from 'react-use-form-state';

interface IProps {
    removeItem: any;
    appItems: any;
    analyserItem: any;
    index: any;
    row: any;
}

interface IState {
    showTests: boolean;
}

const AnalyserTestItem = ({ item }) => (
    <Box>
        <Box>
            <b>{item.title}</b>
        </Box>
        <Flex>
            <span>{item.findRe}</span> <i>|</i>
            <span>{item.takeGroup}</span> <i>|</i>
            <span>{item.takeTitle}</span>
        </Flex>
    </Box>
);

export const AnalyserFormItem = ({ analyserItem, removeItem, appItems, saveItem }) => {
    const [showTests, setShowTests] = React.useState(false);
    const toggleShowTests = () => {
        setShowTests(!showTests);
    };

    const [formState, { text, checkbox }] = useFormState(analyserItem, {
        onChange: (e, stateValues, nextStateValues) => {
            saveItem(nextStateValues);
        },
    });

    return (
        <div>
            <Flex justifyContent="space-between">
                <Flex>
                    <Box p={1}>
                        <Input placeholder="Task" {...text({ name: 'findRe' })} />
                    </Box>
                    <Box p={1}>
                        <Input placeholder="Group" {...text({ name: 'takeGroup' })} />
                    </Box>
                    <Box p={1}>
                        <Input placeholder="Title" {...text({ name: 'takeTitle' })} />
                    </Box>
                </Flex>

                <Form.Item>
                    Active
                    <Switch {...checkbox('active')} />
                </Form.Item>
                <Form.Item>
                    Test
                    <Switch onChange={toggleShowTests} />
                </Form.Item>
                <Button type="primary" shape="circle" icon="delete" onClick={removeItem} />
            </Flex>

            {showTests && (
                <Box>
                    <Divider />
                    {testAnalyserItem(appItems, analyserItem).map(item => (
                        <AnalyserTestItem item={item} key={item.title} />
                    ))}
                </Box>
            )}
        </div>
    );
};
