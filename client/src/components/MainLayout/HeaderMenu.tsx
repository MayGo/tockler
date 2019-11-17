import { Icon, Menu } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import tocklerIcon from '../../assets/icons/tockler_icon.png';
import { Brand, Img } from './HeaderMenu.styles';

const GrayMenu = styled(Menu)``;

export const HeaderMenu = ({ location }: any) => (
    <GrayMenu selectedKeys={[location.pathname]} mode="horizontal">
        <Menu.Item key="/app/timeline2">
            <Link to="/app/timeline">
                <Brand>
                    <Img src={tocklerIcon} width="28" height="28" />
                    <span>Tockler</span>
                </Brand>
            </Link>
        </Menu.Item>
        <Menu.Item key="/app/timeline">
            <Link to="/app/timeline">
                <Icon type="bars" />
                Timeline
            </Link>
        </Menu.Item>
        <Menu.Item key="/app/summary">
            <Link to="/app/summary">
                <Icon type="area-chart" />
                Summary
            </Link>
        </Menu.Item>
        <Menu.Item key="/app/search">
            <Link to="/app/search">
                <Icon type="search" />
                Search
            </Link>
        </Menu.Item>
        <Menu.Item key="/app/settings">
            <Link to="/app/settings">
                <Icon type="setting" />
                Settings
            </Link>
        </Menu.Item>
    </GrayMenu>
);
