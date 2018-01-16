import * as React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'dva/router';

export function Header({ location }: any) {
    return (
        <Menu selectedKeys={[location.pathname]} mode="horizontal" theme="dark">
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
}
