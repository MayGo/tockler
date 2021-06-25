import React from 'react';
import { AnalyserForm } from './AnalyserForm';
import { AppForm } from './AppForm';
import { WorkForm } from './WorkForm';
import { ThemeSelect } from './ThemeSelect';
import { VStack } from '@chakra-ui/react';

export const SettingsForm = () => {
    return (
        <VStack spacing={4} p={4} alignItems="flex-start">
            <ThemeSelect />

            <WorkForm />

            <AppForm />

            <AnalyserForm />
        </VStack>
    );
};
