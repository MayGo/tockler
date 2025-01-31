import { AnalyserForm } from './AnalyserForm';
import { AppForm } from './AppForm';
import { WorkForm } from './WorkForm';
import { VStack } from '@chakra-ui/react';
import { DataForm } from './DataForm';

export const SettingsForm = () => {
    return (
        <VStack spacing={4} p={4} alignItems="flex-start">
            <WorkForm />
            <DataForm />
            <AppForm />

            <AnalyserForm />
        </VStack>
    );
};
