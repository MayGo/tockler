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
            <Menu.Item key="/settings">
                <Link to="/settings">
                    <Icon type="setting" />Settings
                </Link>
            </Menu.Item>
            <Menu.Item key="/404">
                <Link to="/page-you-dont-know">
                    <Icon type="frown-circle" />404
                </Link>
            </Menu.Item>
        </Menu>
    );
}
