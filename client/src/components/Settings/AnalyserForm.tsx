import { Button, Flex, HStack, Tooltip } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { TrackItemType } from '../../enum/TrackItemType';
import { fetchAnalyserSettings, saveAnalyserSettings } from '../../services/settings.api';
import { useStoreState } from '../../store/easyPeasy';
import { CardBox } from '../CardBox';
import { AnalyserFormItem } from './AnalyserFormItem';

interface AnalyserItem {
    findRe: string;
    takeTitle: string;
    takeGroup: string;
    enabled: boolean;
}

const defaultAnalyserSettings: AnalyserItem[] = [
    { findRe: '\\w+-\\d+.*JIRA', takeTitle: '', takeGroup: '\\w+-\\d+', enabled: true },
    { findRe: '9GAG', takeTitle: '', takeGroup: '9GAG', enabled: true },
];

const emptyItem: AnalyserItem = { findRe: '', takeTitle: '', takeGroup: '', enabled: false };

export const AnalyserForm = () => {
    const timeItems = useStoreState((state) => state.timeItems);
    const appItems = timeItems[TrackItemType.AppTrackItem];
    const [analyserItems, setAnalyserItems] = useState<AnalyserItem[]>([]);

    useEffect(() => {
        async function fetchSettings() {
            const items = await fetchAnalyserSettings();
            setAnalyserItems(items || []);
        }

        fetchSettings();
    }, []);

    const removeItem = (index: number) => () => {
        analyserItems.splice(index, 1);
        setAnalyserItems([...analyserItems]);
        saveAnalyserSettings([...analyserItems]);
    };
    const saveItem = (index: number) => (data: AnalyserItem) => {
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
