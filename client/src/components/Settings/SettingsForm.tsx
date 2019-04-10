import * as React from 'react';
import { Flex, Box } from 'grid-styled';
import { Form, Button } from 'antd';
import { WorkFormContainer } from './WorkFormContainer';
import { AppFormContainer } from './AppFormContainer';
import { AnalyserForm } from './AnalyserForm';

interface IProps {
    handleSubmit: any;
}

interface IState {}

export class SettingsForm extends React.PureComponent<IProps, IState> {
    render() {
        return (
            <Form onSubmit={this.props.handleSubmit}>
                <Flex p={1} w={1} flexDirection="column">
                    <Box>
                        <Box p={1} w={1 / 3}>
                            <WorkFormContainer />
                        </Box>

                        <Box p={1} w={1 / 3}>
                            <AppFormContainer />
                        </Box>
                        <Box p={1}>
                            <AnalyserForm />
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
