import React from 'react';
import { AnalyserForm } from './AnalyserForm';
import { AppForm } from './AppForm';
import { WorkForm } from './WorkForm';
import { VStack } from '@chakra-ui/react';
import { Subscriptions } from '../Paywall/Subscriptions';

export const SettingsForm = () => {
    return (
        <VStack spacing={4} p={4} alignItems="flex-start">
            <WorkForm />

            <AppForm />

            <AnalyserForm />
            <Subscriptions />
        </VStack>
    );
};
