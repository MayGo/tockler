import * as React from 'react';
import { Menu, Icon } from 'antd';

import { Brand, Img, RightMenuItem } from './TrayMenu.styles';
import { EventEmitter } from '../../services/EventEmitter';

const tocklerIcon = require('../../assets/icons/tockler_icon.png');

export const TrayMenu = ({ dispatch }: any) => {
    const exitApp = () => {
        EventEmitter.send('close-app');
    };
    const toggleMainWindow = () => {
        EventEmitter.send('toggle-main-window');
    };
    return (
        <Menu mode="horizontal" style={{ position: 'fixed', width: '100%', zIndex: 9000 }}>
            <Menu.Item key="/timeline2">
                <a onClick={toggleMainWindow}>
                    <Brand>
                        <Img src={tocklerIcon} width="28" height="28" />
                        <span>Tockler</span>
                    </Brand>
                </a>
            </Menu.Item>

            <RightMenuItem key="/exitApp">
                <a onClick={exitApp}>
                    <Icon type="poweroff" />
                </a>
            </RightMenuItem>
            <RightMenuItem key="/toggleMainWindow">
                <a onClick={toggleMainWindow}>
                    <Icon type="arrows-alt" />
                </a>
            </RightMenuItem>
        </Menu>
    );
};
