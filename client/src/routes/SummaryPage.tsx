import React from 'react';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { SummaryCalendar } from '../components/SummaryCalendar/SummaryCalendar';
import { SummaryProvider } from '../SummaryContext';
import { LineChart } from '../components/LineCharts/LineChart';
import { LineChartBox } from '../components/LineCharts/LineCharts.styles';
import { VStack } from '@chakra-ui/react';

export function SummaryPage({ location }: any) {
    return (
        <MainLayout location={location}>
            <SummaryProvider>
                <VStack p={4} spacing={4}>
                    <SummaryCalendar />
                    <LineChartBox>
                        <LineChart />
                    </LineChartBox>
                </VStack>
            </SummaryProvider>
        </MainLayout>
    );
}
