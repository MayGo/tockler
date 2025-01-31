import { AiOutlineInfoCircle } from 'react-icons/ai';
import { useState, useEffect } from 'react';
import { AnalyserFormItem } from './AnalyserFormItem';
import { fetchAnalyserSettings, saveAnalyserSettings } from '../../services/settings.api';
import { useStoreState } from '../../store/easyPeasy';
import { Tooltip } from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import { HStack } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { CardBox } from '../CardBox';

const defaultAnalyserSettings = [
    { findRe: '\\w+-\\d+.*JIRA', takeTitle: '', takeGroup: '\\w+-\\d+', enabled: true },
    { findRe: '9GAG', takeTitle: '', takeGroup: '9GAG', enabled: true },
];

const emptyItem = { findRe: '', takeTitle: '', takeGroup: '', enabled: false };

export const AnalyserForm = () => {
    const timeItems = useStoreState((state) => state.timeItems);
    const { appItems } = timeItems;
    const [analyserItems, setAnalyserItems] = useState<any>([]);

    useEffect(() => {
        async function fetchSettings() {
            const items = await fetchAnalyserSettings();
            setAnalyserItems(items || []);
        }

        fetchSettings();
    }, []);

    const removeItem = (index) => () => {
        analyserItems.splice(index, 1);
        setAnalyserItems([...analyserItems]);
        saveAnalyserSettings([...analyserItems]);
    };
    const saveItem = (index) => (data) => {
        analyserItems[index] = data;
        setAnalyserItems([...analyserItems]);
        saveAnalyserSettings([...analyserItems]);
    };

    const addItem = () => {
        setAnalyserItems([...analyserItems, emptyItem]);
    };

    const setDefaults = () => {
        setAnalyserItems([...analyserItems, ...defaultAnalyserSettings]);
        saveAnalyserSettings([...analyserItems, ...defaultAnalyserSettings]);
    };

    return (
        <CardBox
            title="Analyser settings"
            divider
            extra={
                <HStack>
                    <Button onClick={setDefaults} variant="ghost">
                        Add sample values
                    </Button>

                    <Tooltip placement="left" label="Notify if title equals these analyser items.">
                        <span>
                            <AiOutlineInfoCircle style={{ fontSize: 20, color: 'primary' }} />
                        </span>
                    </Tooltip>
                </HStack>
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
            <Flex py={3} justifyContent="flex-end">
                <Button onClick={addItem} aria-label="Add New Item">
                    Add New Item
                </Button>
            </Flex>
        </CardBox>
    );
};
