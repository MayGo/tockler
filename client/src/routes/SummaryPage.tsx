import { VStack } from '@chakra-ui/react';
import { CardBox } from '../components/CardBox';
import { LineChart } from '../components/LineCharts/LineChart';
import { SummaryCalendar } from '../components/SummaryCalendar/SummaryCalendar';
import { SummaryProvider } from '../SummaryContext';

export function SummaryPage() {
    return (
        <SummaryProvider>
            <VStack p={4} spacing={4}>
                <CardBox p={0} position="relative" overflow="hidden">
                    <SummaryCalendar />
                </CardBox>
                <CardBox position="relative" title="Online time" divider>
                    <LineChart />
                </CardBox>
            </VStack>
        </SummaryProvider>
    );
}
