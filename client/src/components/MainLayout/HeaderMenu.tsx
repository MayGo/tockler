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
<<<<<<< HEAD
import { Button } from '@chakra-ui/button';
import { useColorModeValue } from '@chakra-ui/color-mode';

const MenuItem = ({ to, icon, title }) => (
    <Box>
        <Button as={RouterLink} to={to} variant="ghost">
            <Center>
                <Box pr={2}>{icon}</Box>
                {title}
            </Center>
        </Button>
    </Box>
);

export const HeaderMenu = () => (
    <Flex bg={useColorModeValue('gray.100', 'gray.900')} w="100%" h={50} alignItems="center">
        <Box pl={4} pr={3}>
            <Link as={RouterLink} to="/app/timeline">
                <Flex>
                    <Center pr={3}>
                        <Image boxSize="28px" objectFit="cover" src={tocklerIcon} alt="Tockler" />
                    </Center>
                    <Brand>Tockler</Brand>
                </Flex>
            </Link>
        </Box>
        <MenuItem to="/app/timeline" icon={<AiOutlineBars />} title="Timeline" />
        <MenuItem to="/app/summary" icon={<AiOutlineAreaChart />} title="Summary" />
        <MenuItem to="/app/search" icon={<AiOutlineSearch />} title="Search" />
        <MenuItem to="/app/settings" icon={<AiOutlineSetting />} title="Settings" />
        <MenuItem to="/app/support" icon={<AiOutlineQuestionCircle />} title="Support" />{' '}
        <Box flex="1" />
        <Box>
            <ColorModeSwitcher />
        </Box>
    </Flex>
);
