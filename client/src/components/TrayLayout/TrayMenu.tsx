import { Icon, Menu, Tooltip } from 'antd';
import React, { useState, useEffect } from 'react';
import tocklerIcon from '../../assets/icons/tockler_icon.png';
import { EventEmitter } from '../../services/EventEmitter';
import { Brand, Img, MenuItem, RightMenuItem } from './TrayMenu.styles';
import moment from 'moment';
import Moment from 'react-moment';
import { Logger } from '../../logger';

export const TrayMenu = () => {
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
            setOnlineSince(moment());
        };
        const systemIsNotOnline = () => {
            Logger.debug('system-is-not-online');
            setOnlineSince(undefined);
        };
        setOnlineSince(moment());
        EventEmitter.on('system-is-online', systemIsOnline);
        EventEmitter.on('system-is-not-online', systemIsNotOnline);

        return () => {
            EventEmitter.off('system-is-online', systemIsOnline);
            EventEmitter.off('system-is-not-online', systemIsNotOnline);
        };
    }, []);
    return (
        <Menu mode="horizontal" style={{ position: 'fixed', width: '100%', zIndex: 9000 }}>
            <MenuItem key="/timeline2" onClick={toggleMainWindow}>
                <Brand>
                    <Img src={tocklerIcon} width="28" height="28" />
                    <span>Tockler</span>
                </Brand>
            </MenuItem>
            <MenuItem>
                {onlineSince && (
                    <Tooltip placement="bottom" title="Time without a break">
                        <Icon type="clock-circle-o" />
                        <b>
                            <Moment date={onlineSince} durationFromNow interval={1} />
                        </b>
                    </Tooltip>
                )}
            </MenuItem>
            <RightMenuItem key="/exitApp" onClick={exitApp}>
                <Tooltip placement="bottom" title="Quit app">
                    <Icon type="poweroff" />
                </Tooltip>
            </RightMenuItem>
            <RightMenuItem key="/toggleMainWindow" onClick={toggleMainWindow}>
                <Tooltip placement="bottom" title="Open main window">
                    <Icon type="arrows-alt" />
                </Tooltip>
            </RightMenuItem>
        </Menu>
    );
};
