import React from 'react';
import { SpinnerContainer } from './Timeline.styles';
import { Spinner } from '@chakra-ui/spinner';
import { useColorModeValue } from '@chakra-ui/react';

export const Loader = () => (
    <SpinnerContainer bg={useColorModeValue('white', 'black')}>
        <Spinner />
    </SpinnerContainer>
);
