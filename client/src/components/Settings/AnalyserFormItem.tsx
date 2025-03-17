import { Box, Flex, FormControl, FormLabel, HStack, IconButton, Input, Switch, Text } from '@chakra-ui/react';
import { useEffect, useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiOutlineDelete } from 'react-icons/ai';
import { ITrackItem } from '../../@types/ITrackItem';
import { BlackBox } from '../BlackBox';
import { AnalyserItem, AnalyserTestItemI, testAnalyserItem } from './AnalyserForm.util';

interface AnalyserTestItemProps {
    item: AnalyserTestItemI;
}

const AnalyserTestItem = ({ item }: AnalyserTestItemProps) => (
    <Box>
        <Box>
            <b>{item.title}</b>
        </Box>
        <Flex>
            <span>{item.findRe}</span> <i>|</i>
            <span>{item.takeGroup}</span> <i>|</i>
            <span>{item.takeTitle}</span>
        </Flex>
    </Box>
);

type Inputs = {
    findRe: string;
    takeGroup: string;
    takeTitle: string;
    enabled: boolean;
};

interface AnalyserFormItemProps {
    analyserItem: AnalyserItem;
    removeItem: () => void;
    appItems: ITrackItem[];
    saveItem: (data: Inputs) => void;
}

export const AnalyserFormItem = ({ analyserItem, removeItem, appItems, saveItem }: AnalyserFormItemProps) => {
    // Generate unique IDs for this component instance
    const id = useId();
    const enabledSwitchId = `enabled-switch-${id}`;
    const testSwitchId = `test-switch-${id}`;

    const [showTests, setShowTests] = useState(false);
    const toggleShowTests = () => {
        setShowTests(!showTests);
    };

    const {
        watch,
        getValues,
        reset,
        register,
        control,
        formState: { isDirty, isValid },
    } = useForm<Inputs>({ mode: 'onChange', defaultValues: analyserItem });

    const watchAllFields = watch();

    useEffect(() => {
        if (isDirty && isValid) {
            console.info('Save values,', getValues(), analyserItem);
            saveItem(getValues());
            reset(getValues());
        }
    }, [getValues, saveItem, watchAllFields, isDirty, analyserItem, reset, isValid]);

    const analysedItems = (showTests && testAnalyserItem(appItems, analyserItem)) || [];

    return (
        <Box>
            <Flex justifyContent="space-between" py={2}>
                <HStack w="100%" spacing={3}>
                    <Input placeholder="Task" {...register('findRe')} minWidth={200} />

                    <Input placeholder="Group" {...register('takeGroup')} minWidth={200} />

                    <Input placeholder="Title" {...register('takeTitle')} minWidth={200} />
                    <Box px={3}>
                        <FormControl display="flex" alignItems="center" minWidth={100} maxWidth={100}>
                            <FormLabel htmlFor={enabledSwitchId} mb="0">
                                Active
                            </FormLabel>
                            <Controller
                                name="enabled"
                                control={control}
                                render={({ field: { onChange, value, ref } }) => (
                                    <Switch
                                        id={enabledSwitchId}
                                        isChecked={value}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onChange(e.target.checked);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        ref={ref}
                                        size="lg"
                                    />
                                )}
                            />
                        </FormControl>
                    </Box>
                    <Box px={3}>
                        <FormControl display="flex" alignItems="center" minWidth={160} maxWidth={160}>
                            <FormLabel htmlFor={testSwitchId} mb="0">
                                Test mode
                            </FormLabel>
                            <Switch
                                id={testSwitchId}
                                onChange={(e) => {
                                    e.preventDefault();
                                    toggleShowTests();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                size="lg"
                            />
                        </FormControl>
                    </Box>

                    <IconButton
                        icon={<AiOutlineDelete />}
                        variant="ghost"
                        onClick={(e) => {
                            e.preventDefault();
                            removeItem();
                        }}
                        aria-label="Add Item"
                    />
                </HStack>
            </Flex>

            {showTests && (
                <BlackBox p={3}>
                    {analysedItems.length === 0 && <Text>No results</Text>}
                    {analysedItems.map((item) => (
                        <AnalyserTestItem item={item} key={item.title} />
                    ))}
                </BlackBox>
            )}
        </Box>
    );
};
