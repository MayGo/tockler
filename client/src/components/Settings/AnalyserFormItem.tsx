import { useEffect, useState } from 'react';
import { testAnalyserItem } from './AnalyserForm.util';
import { AiOutlineDelete } from 'react-icons/ai';
import { IconButton } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/react';
import { Switch } from '@chakra-ui/react';
import { Box, Flex } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { HStack, Text } from '@chakra-ui/react';
import { BlackBox } from '../BlackBox';

const AnalyserTestItem = ({ item }) => (
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

export const AnalyserFormItem = ({ analyserItem, removeItem, appItems, saveItem }) => {
    const [showTests, setShowTests] = useState(false);
    const toggleShowTests = () => {
        setShowTests(!showTests);
    };

    const {
        watch,
        getValues,
        reset,
        register,
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
        <>
            <Flex justifyContent="space-between" py={2}>
                <HStack w="100%" spacing={3}>
                    <Input placeholder="Task" {...register('findRe')} minWidth={200} />

                    <Input placeholder="Group" {...register('takeGroup')} minWidth={200} />

                    <Input placeholder="Title" {...register('takeTitle')} minWidth={200} />
                    <Box px={3}>
                        <FormControl display="flex" alignItems="center" minWidth={100} maxWidth={100}>
                            <FormLabel htmlFor="active" mb="0">
                                Active
                            </FormLabel>
                            <Switch id="enabled" {...register('enabled')} size="lg" />
                        </FormControl>
                    </Box>
                    <Box px={3}>
                        <FormControl display="flex" alignItems="center" minWidth={160} maxWidth={160}>
                            <FormLabel htmlFor="test" mb="0">
                                Test mode
                            </FormLabel>
                            <Switch id="test" onChange={toggleShowTests} size="lg" />
                        </FormControl>
                    </Box>

                    <IconButton icon={<AiOutlineDelete />} variant="ghost" onClick={removeItem} aria-label="Add Item" />
                </HStack>
            </Flex>

            {showTests && (
                <BlackBox p={3}>
                    {analysedItems.length === 0 && <Text>No results</Text>}
                    {analysedItems.map((item: any) => (
                        <AnalyserTestItem item={item} key={item.title} />
                    ))}
                </BlackBox>
            )}
        </>
    );
};
