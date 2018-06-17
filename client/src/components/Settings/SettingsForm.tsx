import * as React from 'react';
import { Field } from 'redux-form';
import { TextField, SwitchField } from 'redux-form-antd';
import { Flex, Box } from 'grid-styled';

import { Form, Icon, Button, Row, Switch } from 'antd';

interface IProps {
    handleSubmit: any;
}

interface IState {}

export class SettingsForm extends React.Component<IProps, IState> {
    render() {
        return (
            <Form onSubmit={this.props.handleSubmit}>
                <Flex p={1} w={1} flexDirection="column">
                    <h3>Work settings</h3>
                    <Box px={1} w={1 / 3}>
                        <Form.Item>
                            <Field
                                name="work.hoursToWork"
                                type="number"
                                placeholder="Hours to work"
                                component={TextField}
                                prefix={<Icon type="clock-circle-o" />}
                            />
                        </Form.Item>
                    </Box>

                    <Box px={1} w={1 / 3}>
                        <h3>App settings</h3>

                        <Field
                            name="app.openAtLogin"
                            type="text"
                            label="Run at login"
                            labelCol={{ span: 6, offset: 0 }}
                            wrapperCol={{ span: 14, offset: 0 }}
                            size="default"
                            component={SwitchField}
                        />

                        <Row>
                            <Button type="primary" htmlType="submit">
                                Save
                            </Button>
                        </Row>
                    </Box>
                </Flex>
            </Form>
        );
    }
}
