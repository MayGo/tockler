import * as React from 'react';
import { Field } from 'redux-form';
import { TextField } from 'redux-form-antd';
import { Flex, Box } from 'grid-styled';

import { Form, Icon, Button, Row } from 'antd';

interface IProps {
    handleSubmit: any;
}

interface IState {}

export class SettingsForm extends React.Component<IProps, IState> {
    render() {
        return (
            <Flex p={1} w={1}>
                <Box px={1} w={1 / 3}>
                    <Form onSubmit={this.props.handleSubmit}>
                        <Form.Item>
                            <Field
                                name="hoursToWork"
                                type="number"
                                placeholder="Hours to work"
                                component={TextField}
                                prefix={<Icon type="clock-circle-o" />}
                            />
                        </Form.Item>

                        <Row>
                            <Button type="primary" htmlType="submit">
                                Save
                            </Button>
                        </Row>
                    </Form>
                </Box>
            </Flex>
        );
    }
}
