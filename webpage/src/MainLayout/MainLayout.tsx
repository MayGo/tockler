import { Box } from '@chakra-ui/layout';
import {
  Flex,
  HStack,
  IconButton,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa';
import { ColorModeSwitcher } from '../ColorModeSwitcher';
import { TocklerLogo } from '../Header/TocklerLogo';

export function MainLayout({ children }: any) {
  return (
    <>
      <Box
        position="absolute"
        top="-100px"
        right="0"
        width="600px"
        zIndex={0}
        overflow="hidden"
      >
        <TocklerLogo
          boxSize="800px"
          color={useColorModeValue('white', 'black')}
        />
      </Box>
      <Box w="100%" position="relative">
        <Flex w="100%" alignItems="center" position="absolute">
          <Box flex="1" />
          <HStack pr={3}>
            <IconButton
              size="md"
              fontSize="lg"
              aria-label={`Go to github`}
              variant="ghost"
              color="current"
              marginLeft="2"
              href="https://github.com/MayGo/tockler"
              as={Link}
              icon={<FaGithub />}
            />

            <ColorModeSwitcher />
          </HStack>
        </Flex>
        <Box zIndex={1}>{children}</Box>
      </Box>
    </>
  );
}
