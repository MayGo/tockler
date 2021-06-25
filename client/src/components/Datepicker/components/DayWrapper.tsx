import React from 'react';
import { Box, Link, useStyleConfig } from '@chakra-ui/react';

export const DayWrapper = ({ variant, ...rest }) => {
    const styles = useStyleConfig('CalendarDay', { variant });
    return <Box as={Link} __css={styles} data-testid="Day" {...rest} />;
};
