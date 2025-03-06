import { Divider, VStack } from '@chakra-ui/react';
import '../../types/electron-bridge';
import { AnalyserForm } from './AnalyserForm';
import { AppForm } from './AppForm';
import { AppVersion } from './AppVersion';
import { DataForm } from './DataForm';
import { WorkForm } from './WorkForm';

export const SettingsForm = () => {
    return (
        <VStack spacing={4} p={4} alignItems="flex-start" width="100%">
            <WorkForm />
            <DataForm />
            <AppForm />
            <AnalyserForm />

            <Divider my={2} />

            <AppVersion />
        </VStack>
    );
};
