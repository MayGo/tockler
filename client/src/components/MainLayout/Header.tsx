import * as React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'dva/router';
import * as tocklerIcon from '../../assets/icons/tockler_icon.png';

import * as styles from './Header.css';

export function Header({ location }: any) {
    return (
        <div>
            <Menu selectedKeys={[location.pathname]} mode="horizontal">
                <Menu.Item key="/timeline2">
                    <Link to="/timeline">
                        <div className={styles.brand}>
                            <div className={styles.brand_a}>
                                <img
                                    src={tocklerIcon}
                                    className={styles.brand_img}
                                    width="28"
                                    height="28"
                                />
                                <span className={styles.brand_name}>Tockler</span>
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
