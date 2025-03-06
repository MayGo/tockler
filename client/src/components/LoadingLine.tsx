import { Box, useToken } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

// Loading line animation
const loadingAnimation = keyframes`
  0% { width: 0%; left: 0; }
  50% { width: 70%; left: 15%; }
  100% { width: 100%; left: 0; }
`;

export const LoadingLine = () => {
    const [blue500] = useToken('colors', ['blue.500']);

    return (
        <Box
            position="absolute"
            top="0"
            left="0"
            height="2px"
            bg={blue500}
            zIndex={10}
            animation={`${loadingAnimation} 1.5s infinite ease-in-out`}
        />
    );
};
