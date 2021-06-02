import {
    AiOutlineBars,
    AiOutlineAreaChart,
    AiOutlineSearch,
    AiOutlineSetting,
    AiOutlineQuestionCircle,
} from 'react-icons/ai';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import tocklerIcon from '../../assets/icons/tockler_icon.png';
import { Brand } from './HeaderMenu.styles';
import { Flex, Box, Center, Link } from '@chakra-ui/layout';
import { Image } from '@chakra-ui/image';
import { ColorModeSwitcher } from '../ColorModeSwitcher';

export const HeaderMenu = ({ location }: any) => (
    <Flex bg="black" w="100%" p={4} color="white">
        <Box pr={3}>
            <Link as={RouterLink} to="/app/timeline">
                <Flex>
                    <Center pr={3}>
                        <Image boxSize="28px" objectFit="cover" src={tocklerIcon} alt="Tockler" />
                    </Center>
                    <Brand>Tockler</Brand>
                </Flex>
            </Link>
        </Box>
        <Box p={3}>
            <Link as={RouterLink} to="/app/timeline">
                <Center>
                    <Box pr={1}>
                        <AiOutlineBars />
                    </Box>
                    Timeline
                </Center>
            </Link>
        </Box>
        <Box p={3}>
            <Link as={RouterLink} to="/app/summary">
                <Center>
                    <Box pr={1}>
                        <AiOutlineAreaChart />
                    </Box>
                    Summary
                </Center>
            </Link>
        </Box>
        <Box p={3}>
            <Link as={RouterLink} to="/app/search">
                <Center>
                    <Box pr={1}>
                        <AiOutlineSearch />
                    </Box>
                    Search
                </Center>
            </Link>
        </Box>
        <Box p={3}>
            <Link as={RouterLink} to="/app/settings">
                <Center>
                    <Box pr={1}>
                        <AiOutlineSetting />
                    </Box>
                    Settings
                </Center>
            </Link>
        </Box>
        <Box p={3}>
            <Link as={RouterLink} to="/app/support">
                <Center>
                    <Box pr={1}>
                        <AiOutlineQuestionCircle />
                    </Box>
                    Support
                </Center>
            </Link>
        </Box>
        <Box flex="1">
            <Box d="flex" justifySelf="flex-end">
                <ColorModeSwitcher />
            </Box>
        </Box>
    </Flex>
);
