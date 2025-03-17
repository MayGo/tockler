import { Box, Button, Flex, FormControl, FormLabel, HStack, Switch, Text, Tooltip } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { ITrackItem } from '../../@types/ITrackItem';
import { TrackItemType } from '../../enum/TrackItemType';
import {
    fetchAnalyserSettings,
    getTaskAnalyserEnabled,
    saveAnalyserSettings,
    setTaskAnalyserEnabled,
} from '../../services/settings.api';
import { useStoreState } from '../../store/easyPeasy';
import { CardBox } from '../CardBox';
import { AnalyserItem } from './AnalyserForm.util';
import { AnalyserFormItem } from './AnalyserFormItem';

const defaultAnalyserSettings: AnalyserItem[] = [
    { findRe: '\\w+-\\d+.*JIRA', takeTitle: '', takeGroup: '\\w+-\\d+', enabled: true },
    { findRe: '9GAG', takeTitle: '', takeGroup: '9GAG', enabled: true },
];

const emptyItem: AnalyserItem = { findRe: '', takeTitle: '', takeGroup: '', enabled: false };

const EMPTY_APP_ITEMS: ITrackItem[] = [];

export const AnalyserForm = () => {
    const timeItems = useStoreState((state) => state.timeItems);
    const appItems = timeItems[TrackItemType.AppTrackItem];
    const [analyserItems, setAnalyserItems] = useState<AnalyserItem[]>([]);
    const [isAnalyserEnabled, setIsAnalyserEnabled] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            const items = await fetchAnalyserSettings();
            setAnalyserItems(items || []);

            const enabled = await getTaskAnalyserEnabled();
            setIsAnalyserEnabled(enabled);
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

    const handleAnalyserToggle = async (e) => {
        const enabled = e.target.checked;
        setIsAnalyserEnabled(enabled);
        await setTaskAnalyserEnabled(enabled);
    };

    return (
        <CardBox
            title="Analyser settings"
            divider
            extra={
                isAnalyserEnabled && (
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
                )
            }
        >
            <Flex alignItems="center" pb={3}>
                <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="analyser-enabled" mb="0">
                        Enable task analyser
                    </FormLabel>
                    <Switch
                        id="analyser-enabled"
                        isChecked={isAnalyserEnabled}
                        onChange={handleAnalyserToggle}
                        size="lg"
                        pr={4}
                    />
                    {isAnalyserEnabled ? (
                        <Text fontSize="sm" color="gray.500">
                            When enabled, the task analyser will automatically suggest tasks based on your window
                            activity
                        </Text>
                    ) : (
                        <Text fontSize="sm" color="gray.500" ml={4}>
                            Enable to automatically suggest tasks based on your window activity
                        </Text>
                    )}
                </FormControl>
            </Flex>

            {isAnalyserEnabled && (
                <>
                    <Box my={2}>
                        <Text fontSize="sm" color="gray.500">
                            Note: Please ensure that notifications are allowed in your system settings, as they may not
                            appear otherwise.
                        </Text>
                    </Box>
                    {analyserItems.map((item, index) => (
                        <AnalyserFormItem
                            key={index}
                            appItems={appItems || EMPTY_APP_ITEMS}
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
                </>
            )}
        </CardBox>
    );
};
