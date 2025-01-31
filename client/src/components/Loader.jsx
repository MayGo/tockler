import { Box, CircularProgress } from '@chakra-ui/react';

export const Loader = () => {
    return (
        <Box display="flex" justifyContent="center" pt={6}>
            <CircularProgress isIndeterminate color="brand.mainColor" />
        </Box>
    );
};
