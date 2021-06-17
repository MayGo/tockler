import React from 'react';
import { SpinnerContainer } from './Timeline.styles';
import { Spinner } from '@chakra-ui/spinner';

export const Loader = () => (
    <SpinnerContainer>
        <Spinner />
    </SpinnerContainer>
);
