import React from 'react';
import tocklerIcon from '../../assets/icons/tockler_icon.png';
import { Brand } from './Header.styles';
import { Flex, Box, Center, Link } from '@chakra-ui/layout';
import { Image } from '@chakra-ui/image';
import { useColorModeValue } from '@chakra-ui/color-mode';

export const Header = ({ children, brandLinkProps }) => (
    <Flex
        bg={useColorModeValue('gray.100', 'gray.900')}
        w="100%"
        h={50}
        alignItems="center"
        zIndex={100}
        borderBottomWidth={1}
        borderBottomColor={useColorModeValue('gray.100', 'gray.700')}
        position="sticky"
        top={0}
    >
        <Box pl={4} pr={3}>
            <Link {...brandLinkProps} _hover={{ textDecoration: 'none' }}>
                <Flex>
                    <Center pr={3}>
                        <Image boxSize="28px" objectFit="cover" src={tocklerIcon} alt="Tockler" />
                    </Center>
                    <Brand>Tockler</Brand>
                </Flex>
            </Link>
        </Box>
        {children}
    </Flex>
);
