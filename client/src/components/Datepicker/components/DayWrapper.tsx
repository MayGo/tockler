import { Box, useStyleConfig } from '@chakra-ui/react';

export const DayWrapper = ({ variant, ...rest }) => {
    const styles = useStyleConfig('CalendarDay', { variant });
    return <Box __css={styles} data-testid="Day" {...rest} />;
};
