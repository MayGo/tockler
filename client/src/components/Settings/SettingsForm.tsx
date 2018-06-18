import * as React from 'react';
import { Field } from 'redux-form';
import { TextField, SwitchField } from 'redux-form-antd';
import { Flex, Box } from 'grid-styled';

import { Form, Icon, Button, Card } from 'antd';

interface IProps {
    handleSubmit: any;
}

const labelCol = { span: 6, offset: 0 };
const wrapperCol = { span: 14, offset: 0 };

interface IState {}

export class SettingsForm extends React.Component<IProps, IState> {
    render() {
        return (
            <Form onSubmit={this.props.handleSubmit}>
                <Flex p={1} w={1} flexDirection="column">
                    <Box w={1 / 3}>
                        <Box p={1}>
                            <Card title="Work settings">
                                <Form.Item>
                                    <Field
                                        name="work.hoursToWork"
                                        type="number"
                                        label="Workday length"
                                        labelCol={labelCol}
                                        wrapperCol={wrapperCol}
                                        component={TextField}
                                        prefix={<Icon type="clock-circle-o" />}
                                    />
                                </Form.Item>
                            </Card>
                        </Box>

                        <Box p={1}>
                            <Card title="App settings">
                                <Form.Item>
                                    <Field
                                        name="app.openAtLogin"
                                        type="text"
                                        label="Run at login"
                                        labelCol={labelCol}
                                        wrapperCol={wrapperCol}
                                        size="default"
                                        component={SwitchField}
                                    />
                                </Form.Item>
                            </Card>
                        </Box>
                        <Flex p={1} justifyContent="flex-end">
                            <Button type="primary" htmlType="submit">
                                Save
                            </Button>
                        </Flex>
                    </Box>
                </Flex>
            </Form>
        );
    }
}
