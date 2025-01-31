import {
    AiOutlineBars,
    AiOutlineAreaChart,
    AiOutlineSearch,
    AiOutlineSetting,
    AiOutlineQuestionCircle,
} from 'react-icons/ai';

import { Box } from '@chakra-ui/react';
import { ColorModeSwitcher } from '../ColorModeSwitcher';
import { Header } from '../Header/Header';
import { MenuItem } from '../Header/MenuItem';
import { Link as RouterLink } from 'react-router-dom';

export const HeaderMenu = () => (
    <Header brandLinkProps={{ to: '/timeline', as: RouterLink }}>
        <MenuItem to="/timeline" icon={<AiOutlineBars />} title="Timeline" />
        <MenuItem to="/summary" icon={<AiOutlineAreaChart />} title="Summary" />
        <MenuItem to="/search" icon={<AiOutlineSearch />} title="Search" />
        <MenuItem to="/settings" icon={<AiOutlineSetting />} title="Settings" />
        <MenuItem to="/support" icon={<AiOutlineQuestionCircle />} title="Support" />
        {/*<MenuItem to="/trayPage" icon={<AiFillTrademarkCircle />} title="Tray" />*/}
        <Box flex="1" />

        <Box>
            <ColorModeSwitcher />
        </Box>
    </Header>
);
