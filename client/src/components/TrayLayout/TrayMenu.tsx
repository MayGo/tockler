import * as React from 'react';
import { Menu, Icon, Button } from 'antd';
import { Brand, Img, RightMenuItem, MenuItem } from './TrayMenu.styles';
import { EventEmitter } from '../../services/EventEmitter';
import tocklerIcon from '../../assets/icons/tockler_icon.png';

export const TrayMenu = ({ dispatch }: any) => {
    const exitApp = () => {
        EventEmitter.send('close-app');
    };
    const toggleMainWindow = () => {
        EventEmitter.send('toggle-main-window');
    };
    return (
        <Menu mode="horizontal" style={{ position: 'fixed', width: '100%', zIndex: 9000 }}>
            <MenuItem key="/timeline2" onClick={toggleMainWindow}>
                <Brand>
                    <Img src={tocklerIcon} width="28" height="28" />
                    <span>Tockler</span>
                </Brand>
            </MenuItem>

            <RightMenuItem key="/exitApp" onClick={exitApp}>
                <Icon type="poweroff" />
            </RightMenuItem>
            <RightMenuItem key="/toggleMainWindow" onClick={toggleMainWindow}>
                <Icon type="arrows-alt" />
            </RightMenuItem>
        </Menu>
    );
};
