import * as React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'dva/router';
import { Brand, Img } from './HeaderMenu.styles';

const tocklerIcon = require('../../assets/icons/tockler_icon.png');

export const HeaderMenu = ({ location }: any) => (
    <Menu selectedKeys={[location.pathname]} mode="horizontal">
        <Menu.Item key="/timeline2">
            <Link to="/timeline">
                <Brand>
                    <Img src={tocklerIcon} width="28" height="28" />
                    <span>Tockler</span>
                </Brand>
            </Link>
        </Menu.Item>
        <Menu.Item key="/timeline">
            <Link to="/timeline">
                <Icon type="bars" />Timeline
            </Link>
        </Menu.Item>
        <Menu.Item key="/summary">
            <Link to="/summary">
                <Icon type="area-chart" />Summary
            </Link>
        </Menu.Item>
        <Menu.Item key="/settings">
            <Link to="/settings">
                <Icon type="setting" />Settings
            </Link>
        </Menu.Item>
    </Menu>
);
