import React from 'react';
import { Box, useStyleConfig } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export const DayWrapper = ({ variant, ...rest }) => {
    const styles = useStyleConfig('CalendarDay', { variant });
    return <Box as={RouterLink} __css={styles} data-testid="Day" {...rest} />;
};
