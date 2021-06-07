import { AiOutlineInfoCircle, AiOutlinePlus } from 'react-icons/ai';
import React, { useState, useEffect } from 'react';
import { AnalyserFormItem } from './AnalyserFormItem';
import { fetchAnalyserSettings, saveAnalyserSettings } from '../../services/settings.api';
import { useStoreState } from '../../store/easyPeasy';
import { Card } from '../Card';
import { Tooltip } from '@chakra-ui/tooltip';
import { Flex } from '@chakra-ui/layout';
import { Button, IconButton } from '@chakra-ui/button';

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
                <Tooltip placement="left" label="Notify if title equals these analyser items.">
                    <span>
                        <AiOutlineInfoCircle style={{ fontSize: 20, color: 'primary' }} />
                    </span>
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
                <IconButton icon={<AiOutlinePlus />} onClick={addItem} aria-label="Add Item" />
            </Flex>

            <Flex p={1} justifyContent="flex-start">
                <Button onClick={setDefaults}>Add sample values</Button>
            </Flex>
        </Card>
    );
};
