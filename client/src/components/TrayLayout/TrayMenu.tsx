import { Menu, Tooltip } from 'antd';
import { ClockCircleOutlined, PoweroffOutlined, ArrowsAltOutlined } from '@ant-design/icons';
import React, { useState, useEffect, memo } from 'react';
import tocklerIcon from '../../assets/icons/tockler_icon.png';
import { EventEmitter } from '../../services/EventEmitter';
import { getOnlineStartTime } from '../../services/trackItem.api';
import { Brand, Img, MenuItem, RightMenuItem } from './TrayMenu.styles';
import moment from 'moment';
import Moment from 'react-moment';
import { Logger } from '../../logger';
import { useWindowFocused } from '../../hooks/windowFocusedHook';

const getNow = () => moment().subtract(1, 'seconds');

export const TrayMenuPlain = () => {
    const { windowIsActive } = useWindowFocused();
    const [onlineSince, setOnlineSince] = useState();
    const exitApp = () => {
        EventEmitter.send('close-app');
    };
    const toggleMainWindow = () => {
        EventEmitter.send('toggle-main-window');
    };

    useEffect(() => {
        const systemIsOnline = () => {
            Logger.debug('system-is-online');
            setOnlineSince(getNow());
        };
        const systemIsNotOnline = () => {
            Logger.debug('system-is-not-online');
            setOnlineSince(null);
        };

        EventEmitter.on('system-is-online', systemIsOnline);
        EventEmitter.on('system-is-not-online', systemIsNotOnline);

        return () => {
            EventEmitter.off('system-is-online', systemIsOnline);
            EventEmitter.off('system-is-not-online', systemIsNotOnline);
        };
    }, []);

    useEffect(() => {
        if (windowIsActive) {
            const loadOnlineStartTime = async () => {
                const onlineStartTime = await getOnlineStartTime();

                setOnlineSince(onlineStartTime ? moment(onlineStartTime) : getNow());
            };

            loadOnlineStartTime();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowIsActive]);

    return (
        <Menu
            mode="horizontal"
            style={{ position: 'fixed', width: '100%', zIndex: 9000 }}
            selectable={false}
        >
            <MenuItem key="/timeline2" onClick={toggleMainWindow}>
                <Brand>
                    <Img src={tocklerIcon} width="28" height="28" />
                    <span>GitStart DevTime</span>
                </Brand>
            </MenuItem>
            <MenuItem>
                {onlineSince && (
                    <Tooltip placement="bottom" title="Time without a break">
                        <>
                            <ClockCircleOutlined />{' '}
                            <b>
                                <Moment date={onlineSince} durationFromNow interval={60} />
                            </b>
                        </>
                    </Tooltip>
                )}
            </MenuItem>
            <RightMenuItem key="/exitApp" onClick={exitApp}>
                <Tooltip placement="bottom" title="Quit app">
                    <PoweroffOutlined />
                </Tooltip>
            </RightMenuItem>
            <RightMenuItem key="/toggleMainWindow" onClick={toggleMainWindow}>
                <Tooltip placement="bottom" title="Open main window">
                    <ArrowsAltOutlined />
                </Tooltip>
            </RightMenuItem>
        </Menu>
    );
};

TrayMenuPlain.whyDidYouRender = true;

export const TrayMenu = memo(TrayMenuPlain);
