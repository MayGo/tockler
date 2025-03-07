import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { useState } from 'react';
import { useStoreActions, useStoreState } from '../store/easyPeasy';

const BELOW_SEARCH_BAR_HEIGHT = 70;

export function LiveViewOverlay() {
    const liveView = useStoreState((state) => state.liveView);
    const setLiveView = useStoreActions((actions) => actions.setLiveView);

    const [isHovering, setIsHovering] = useState(false);

    const overlayBoxBg = useColorModeValue('white', 'gray.800');

    const handleOverlayClick = () => {
        setLiveView(false);
    };

    return (
        <>
            {liveView && (
                <Box
                    position="absolute"
                    top={`${BELOW_SEARCH_BAR_HEIGHT}px`}
                    left={0}
                    right={0}
                    bottom={0}
                    backdropFilter={isHovering ? 'blur(2px)' : 'none'}
                    zIndex={10}
                    cursor="pointer"
                    onClick={handleOverlayClick}
                    borderRadius="md"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    _hover={isHovering ? { bg: 'rgba(0, 0, 0, 0.4)' } : {}}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    m={4}
                >
                    {isHovering && (
                        <Box bg={overlayBoxBg} borderRadius="lg" boxShadow="xl" maxW="md" p={8} textAlign="left">
                            <Text fontSize="xl" fontWeight="bold" mb={2}>
                                Live View Active
                            </Text>
                            <Text mb={4} lineHeight="2.5">
                                The timeline is automatically updating in real-time.
                                <br />
                                It's best to disable it before making edits.
                                <br />
                                Click anywhere to disable live view.
                            </Text>
                        </Box>
                    )}
                </Box>
            )}
        </>
    );
}
