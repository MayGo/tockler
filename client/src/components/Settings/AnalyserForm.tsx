import { Flex } from 'reflexbox';
import { Button, Card, Tooltip } from 'antd';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { AnalyserFormItem } from './AnalyserFormItem';
import { fetchAnalyserSettings, saveAnalyserSettings } from '../../services/settings.api';
import { useStoreState } from '../../store/easyPeasy';

const defaultAnalyserSettings = [
    { findRe: '\\w+-\\d+.*JIRA', takeTitle: '', takeGroup: '\\w+-\\d+', enabled: true },
    { findRe: '9GAG', takeTitle: '', takeGroup: '9GAG', enabled: true },
];

const emptyItem = { findRe: '', takeTitle: '', takeGroup: '', enabled: false };

export const AnalyserForm = () => {
    const timeItems = useStoreState(state => state.timeItems);
    const { appItems } = timeItems;
    const [analyserItems, setAnalyserItems] = useState<any>([]);

    useEffect(() => {
        async function fetchSettings() {
            const items = await fetchAnalyserSettings();
            setAnalyserItems(items || []);
        }

        fetchSettings();
    }, []);

    const removeItem = index => () => {
        analyserItems.splice(index, 1);
        setAnalyserItems([...analyserItems]);
        saveAnalyserSettings([...analyserItems]);
    };
    const saveItem = index => data => {
        analyserItems[index] = data;
        setAnalyserItems([...analyserItems]);
        saveAnalyserSettings([...analyserItems]);
    };

    const addItem = () => {
        setAnalyserItems([...analyserItems, emptyItem]);
    };

    const setDefaults = () => {
        setAnalyserItems([...analyserItems, ...defaultAnalyserSettings]);
    };

    return (
        <Card
            title="Analyser settings"
            extra={
                <Tooltip placement="left" title="Notify if title equals these analyser items.">
                    <InfoCircleOutlined style={{ fontSize: 20, color: 'primary' }} />
                </Tooltip>
            }
        >
            {analyserItems.map((item, index) => (
                <AnalyserFormItem
                    key={index}
                    appItems={appItems}
                    removeItem={removeItem(index)}
                    saveItem={saveItem(index)}
                    analyserItem={item}
                />
            ))}
            <Flex p={1} justifyContent="flex-end">
                <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={addItem} />
            </Flex>

            <Flex p={1} justifyContent="flex-start">
                <Button onClick={setDefaults}>Add sample values</Button>
            </Flex>
        </Card>
    );
};
