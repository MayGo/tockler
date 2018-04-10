import * as React from 'react';
// import { Layout } from 'antd';
import { List } from 'antd';
import styled from 'styled-components';
import { TrayListItem } from './TrayListItem';

const CustomList = styled(List)``;

export function TrayList({ children, lastLogItems, loading, dispatch, runningLogItem }: any) {
    function startNewLogItemFromOld(oldItem) {
        dispatch({
            type: 'tray/startNewLogItem',
            payload: { item: oldItem },
        });
    }
    function stopRunningLogItem(oldItem) {
        dispatch({
            type: 'tray/stopRunningLogItem',
        });
    }

    return (
        <CustomList
            loading={loading}
            itemLayout="horizontal"
            dataSource={lastLogItems}
            renderItem={item => (
                <TrayListItem
                    item={item}
                    isRunning={runningLogItem && item.id === runningLogItem.id}
                    startNewLogItemFromOld={startNewLogItemFromOld}
                    stopRunningLogItem={stopRunningLogItem}
                />
            )}
        />
    );
}
