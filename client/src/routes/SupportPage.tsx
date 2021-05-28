import React from 'react';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { Box } from 'reflexbox';
import { Typography } from 'antd';
const { Title, Paragraph } = Typography;

export function SupportPage({ location }: any) {
    return (
        <MainLayout location={location}>
            <Box p={4} width={0.5}>
                <Title level={3}>Contact Support</Title>
                <Paragraph>Feel free to file bug tickets at support.gitstart.com</Paragraph>
            </Box>
        </MainLayout>
    );
}
