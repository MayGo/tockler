import * as React from 'react';
import { Field } from 'redux-form';
import { TextField, SwitchField } from 'redux-form-antd';
import { Flex, Box } from 'grid-styled';
import { Form, Switch, Button, Divider } from 'antd';
import { labelCol, wrapperCol } from './SettingsForm.styles';
import { testAnalyserItem } from './AnalyserForm.util';

interface IProps {
    removeItem: any;
    appTrackItems: any;
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

export class AnalyserFormItem extends React.PureComponent<IProps, IState> {
    state = { showTests: false };

    toggleShowTests = () => {
        this.setState({ showTests: !this.state.showTests });
    };

    render() {
        const { analyserItem, index, row, removeItem, appTrackItems } = this.props;
        const { showTests } = this.state;

        return (
            <div key={index}>
                <Flex w={1}>
                    <Field
                        name={`${row}.findRe`}
                        type="text"
                        label="Task"
                        labelCol={labelCol}
                        wrapperCol={wrapperCol}
                        component={TextField}
                    />

                    <Field
                        name={`${row}.takeGroup`}
                        type="text"
                        label="Group"
                        labelCol={labelCol}
                        wrapperCol={wrapperCol}
                        component={TextField}
                    />

                    <Field
                        name={`${row}.takeTitle`}
                        type="text"
                        label="Title"
                        labelCol={labelCol}
                        wrapperCol={wrapperCol}
                        component={TextField}
                    />

                    <Field
                        name={`${row}.enabled`}
                        type="text"
                        label="Active"
                        labelCol={labelCol}
                        wrapperCol={wrapperCol}
                        size="default"
                        component={SwitchField}
                    />

                    <Form.Item>
                        Test
                        <Switch onChange={this.toggleShowTests} />
                    </Form.Item>

                    <Button type="primary" shape="circle" icon="delete" onClick={removeItem} />
                </Flex>

                {showTests && (
                    <Box>
                        <Divider />
                        {testAnalyserItem(appTrackItems, analyserItem).map(item => (
                            <AnalyserTestItem item={item} key={item.title} />
                        ))}
                    </Box>
                )}
            </div>
        );
    }
}
