import * as React from 'react';
import { Menu, Icon } from 'antd';

import { Brand, Img } from './TrayMenu.styles';

const tocklerIcon = require('../../assets/icons/tockler_icon.png');
//  tslint:disable-next-line

export const TrayMenu = ({ dispatch }: any) => {
    const exitApp = () => {
        console.log('exit');
        dispatch({ type: 'tray/closeApp' });
    };
    const toggleMainWindow = () => {
        console.log('toggleMainWindow');
        dispatch({ type: 'tray/toggleMainWindow' });
    };
    return (
        <Menu mode="horizontal">
            <Menu.Item key="/timeline2">
                <a onClick={toggleMainWindow}>
                    <Brand>
                        <Img src={tocklerIcon} width="28" height="28" />
                        <span>Tockler</span>
                    </Brand>
                </a>
            </Menu.Item>

            <Menu.Item key="/toggleMainWindow">
                <a onClick={toggleMainWindow}>
                    <Icon type="arrows-alt" />
                </a>
            </Menu.Item>
            <Menu.Item key="/exitApp">
                <a onClick={exitApp}>
                    <Icon type="poweroff" />
                </a>
            </Menu.Item>
        </Menu>
    );
};
