import { Icon, Menu } from 'antd';
import * as React from 'react';
import tocklerIcon from '../../assets/icons/tockler_icon.png';
import { EventEmitter } from '../../services/EventEmitter';
import { Brand, Img, MenuItem, RightMenuItem } from './TrayMenu.styles';

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
