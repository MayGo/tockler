import * as React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'dva/router';
const tocklerIcon = require('../../assets/icons/tockler_icon.png');
export function Header({ location }: any) {
    return (
        <div>
            <Menu selectedKeys={[location.pathname]} mode="horizontal">
                <Menu.Item key="/timeline2">
                    <Link to="/timeline">
                        <div>
                            <div>
                                <img src={tocklerIcon} width="28" height="28" />
                                <span>Tockler</span>
                            </div>
                        </div>
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
        </div>
    );
}
